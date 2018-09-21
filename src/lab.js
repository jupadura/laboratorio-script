var labScript = {
    ventana: null,
    muestraEnProceso: null,
    count: 0,
    elementosUI: {
        filtroCodigo: '[id="form1:j_id68"]',
        filtroBotonBuscarCodigo: '[id="form1:j_id70"]',
        valor: '[id="form1:j_id179"]',
        observacion: '[id="form1:j_id192"]',
        estado: '[id="form1:j_id197"]',
        guardar: '[id="form1:j_id203"]',
        agregarParametro: '[id="form1:tblListaDatos_SeguimientoAnalisis:j_id149"]',
        filas: '[id="form1:tblListaDatos_ParametrosAnalista"] .iceRowSel',
        columnasParametro: '[id="form1:tblListaDatos_ParametrosAnalista"] tbody tr > td:nth-child(4) span'
    },
    codigosEstados: {
        1: 'No asignado',
        2: 'En espera',
        3: 'En análisis',
        4: 'Revisión calidad',
        5: 'Rechazado',
        6: 'Análisis posterior calidad',
        7: 'Finalizado'
    },
    openModal: function () { document.querySelector('#modal').removeAttribute('hidden'); },
    closeModal: function () { document.querySelector('#modal').setAttribute('hidden',''); },
    getElement: function (selector) { return this.ventana.document.querySelector(selector); },
    existElement: function (resolve, selector, reject) { 
        setTimeout(() => {
            var element = this.getElement(selector);
            if (element) {
                resolve(element);
                this.count = 0;
            } else if (reject && ++this.count === 60) {
                reject({ clase: 'sample-not-found', mensaje: 'Muestra no encontrada' });
                this.count = 0;
            }  else {
                this.existElement(resolve, selector, reject);
            }
        }, 1000);
    },
    nextPage: function (element, resolve, reject) {
        setTimeout(() => {
            if (element.textContent === this.getElement('.iceDatPgrTbl .iceDatPgrScrCol a').textContent) {
                this.findCodeRow(resolve, reject);
            } else {
                this.nextPage(element, resolve, reject);
            }
        }, 500);
    },
    findCodeRow: function (resolve, reject) {
        var spans = this.ventana.document.querySelectorAll(this.elementosUI.columnasParametro);
        var regex = new RegExp(this.muestraEnProceso.muestra.parametro, 'i');
        for (var index = 0; spans.length > index; index++) {	
            if (regex.test(spans[index].textContent)) {
                resolve(spans[index].parentElement.parentElement);
                return;
            }
        }
        var link = this.getElement('.iceDatPgrTbl .iceDatPgrScrCol');
        if (link && link.nextSibling) {
            var nextPage = link.nextSibling.querySelector('a');
            nextPage.click();
            this.nextPage(nextPage, resolve, reject);
        } else {
            reject({ clase: 'parameter-not-found', mensaje: 'No se encontro el parametro' });
        }
        
    },
    existPagesTable: function () {
        this.getElement(this.elementosUI.filtroCodigo).value = this.muestraEnProceso.muestra.codigo;
        this.getElement(this.elementosUI.filtroBotonBuscarCodigo).click();
        return new Promise((resolve, reject) => this.existElement(resolve, this.elementosUI.filas, reject));
    },
    seguimientoMuestra: function (element) {
        var botonSeguimiento = 'td:nth-child(11) a';
                
        element.querySelector(botonSeguimiento).click();
        var promise = new Promise(resolve => this.existElement(resolve, this.elementosUI.agregarParametro));
        promise.then(botonAgregarParametro => {
            botonAgregarParametro.click();
            return new Promise(resolve => this.existElement(resolve, this.elementosUI.valor));
        }).then(inputResultado => {
            inputResultado.value = this.muestraEnProceso.muestra.valor;
            this.getElement(this.elementosUI.observacion).value = this.muestraEnProceso.muestra.observacion;
            this.getElement(this.elementosUI.estado).value = this.muestraEnProceso.muestra.estado;
            this.getElement(this.elementosUI.guardar).click();
        })
    },
    createRows: function () {
        var value = document.querySelector('#muestrasCSV').value;
        document.querySelector('#muestrasCSV').value = '';
        var muestras = value.split('\n');             
        if (muestras.length) {
            muestras.map(muestra => {
                var splitted = String(muestra).split(';');
                this.addRow({
                    'codigo': String(splitted[0] || '').trim(), 
                    'parametro': String(splitted[1] || '').trim(), 
                    'estado': String(splitted[2] || '').trim(), 
                    'valor': String(splitted[3] || '').trim(), 
                    'observacion': String(splitted[4] || '').trim()
                });
            });
        }     
        this.closeModal();
        this.procesarMuestras();
    },
    addRow: function (muestra) {        
        if (muestra.codigo && muestra.parametro && muestra.estado && muestra.valor) {
            var tbody = document.querySelector('#tableTbody');
            var template = document.querySelector('#rowTemplate').content.cloneNode(true);
            template.querySelector('tr').setAttribute('id', 'Muestra' + (Math.random() + Date()).replace(/[\W]/g, ''));
            template.querySelector('tr').muestra = muestra;
            for (var key in muestra) {
                var valor = key === 'estado' ?  this.codigosEstados[muestra[key]] : muestra[key];
                template.querySelector(`.${key}`).textContent = valor;
            }
            tbody.appendChild(template);
        }
    },
    procesarMuestras: function () {
        if (this.ventana === null) {
            this.muestraEnProceso = document.querySelector('[id].new-register');
            if (this.muestraEnProceso) {
                this.muestraEnProceso.setAttribute('class', 'processing-register');
                this.muestraEnProceso.querySelector('td:last-child').textContent = 'Procesando';
                
                this.ventana = window.open(window.location.href, '', 'fullscreen=no');
                this.ventana.alert = mensaje => {
                    this.actualizarRegistro('processed-register', mensaje);
                };

                new Promise(resolve => this.existElement(resolve, this.elementosUI.filtroCodigo))
                    .then(() => this.existPagesTable())
                    .then(() => ( new Promise((resolve, reject) => this.findCodeRow(resolve, reject))))
                    .then((element) => this.seguimientoMuestra(element))
                    .catch(error => this.actualizarRegistro(error.clase, error.mensaje))
            }
        }
    },
    actualizarRegistro: function (clase, mensaje) {
        this.ventana.close();
        this.ventana = null;
        this.muestraEnProceso.setAttribute('class', clase);
        this.muestraEnProceso.querySelector('td:last-child').textContent = mensaje;
        this.procesarMuestras();
    }
};