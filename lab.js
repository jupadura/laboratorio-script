var iniciar = () => {
	var actualizarMuestra = muestras => {		
		var properties = String(muestras.pop()).split(';');
		if (properties.length >= 4) {
			var codigo = properties[0];
			var tipo = properties[1];
			var estado = properties[2];
			var valor = properties[3];
			var observacion = properties[4] || '';
			
			var ventana = window.open(window.location.href, '', 'fullscreen=no');
			ventana.alert = () => {
				ventana.close();
				muestrasProcesadas.innerHTML += `
					<h5>
						codigo: <strong>${codigo}</strong> - 
						tipo: <strong>${tipo}</strong> - 
						estado: <strong>${estado}</strong> - 
						valor: <strong>${valor}</strong> - 
						observacion: <strong>${observacion}</strong>
					</h5>
				`;
				actualizarMuestra(muestras);
			};

			var getElement = selector => ventana.document.querySelector(selector);
		
			var existElement = (resolve, selector) => {
				setTimeout(() => {
					var element = getElement(selector);
					element ? resolve(element) : existElement(resolve, selector);
				}, 1000);
			}
		
			var nextPage = (element, resolve) => {
				setTimeout(() => {
					if (element.textContent === ventana.document.querySelector('.iceDatPgrTbl .iceDatPgrScrCol a').textContent) {
						findCodeRow(resolve);
					} else {
						nextPage(element, resolve);
					}
				}, 500);
			};
		
			var findCodeRow = (resolve) => {
				var selector = '[id="form1:tblListaDatos_ParametrosAnalista"] tbody tr > td:nth-child(4) span';
				var spans = ventana.document.querySelectorAll(selector);
				var regex = new RegExp(tipo, 'i');
				for (var index = 0; spans.length > index; index++) {	
					if (regex.test(spans[index].textContent)) {
						resolve(spans[index].parentElement.parentElement);
						return;
					}
				}
				
				var link = ventana.document.querySelector('.iceDatPgrTbl .iceDatPgrScrCol').nextSibling.querySelector('a');
				link.click();
				nextPage(link, resolve);
			};
		
			var existPagesTable = () => {
				getElement('[id="form1:j_id68"]').value = codigo;
				getElement('[id="form1:j_id70"]').click();
				return new Promise(resolve => existElement(resolve, '.iceDatPgrTbl'));
			};
		
			var seguimientoMuestra = element => {
				// var campoFecha = 'td:nth-child(8) input';
				// var campoAnalista = '[id="form1:tblListaDatos_ParametrosAnalista:0:j_id114"] [value="' + analista + '"]';
				var botonSeguimiento = 'td:nth-child(11) a';
						
				element.querySelector(botonSeguimiento).click();
				var promise = new Promise(resolve => existElement(resolve, '[id="form1:tblListaDatos_SeguimientoAnalisis:j_id149"]'));
				promise.then(botonAgregarParametro => {
					botonAgregarParametro.click();
					return new Promise(resolve => existElement(resolve, '[id="form1:j_id179"]'));
				}).then(inputResultado => {
					inputResultado.value = valor;
					return new Promise(resolve => existElement(resolve, '[id="form1:j_id192"]'));
				}).then(inputObsevacion => {
					inputObsevacion.value = observacion;
					return new Promise(resolve => existElement(resolve, '[id="form1:j_id197"]'));
				}).then(selectEstado => {
					selectEstado.value = estado;
					return new Promise(resolve => existElement(resolve, '[id="form1:j_id203"]'));
				}).then(botonGuardar => {
					botonGuardar.click();
				})
			};

			
			new Promise(resolve => existElement(resolve, '[id="form1:j_id61"]'))
				 .then(existPagesTable)
				 .then(() => ( new Promise(resolve => findCodeRow(resolve))))
				 .then(seguimientoMuestra)
		} else if (muestras.length) {
			actualizarMuestra(muestras);
		}
	}

	var value = document.querySelector('#muestrasCSV').value;
	document.querySelector('#muestrasCSV').value = '';
	
	var muestras = value.split('\n').reverse();
	if (muestras.length) {
		actualizarMuestra(muestras);
	}
	
}


document.body.innerHTML = `
	<h5>
		Revision calidad: 4, Rechazado: 5, Finalizado: 7
	</h5>
	<h3>
		CODIGO;PARAMETRO;ESTADO;VALOR<;OBSERVACION>
	</h3>
	<div>
		<textarea rows="20" style="width:100%" id="muestrasCSV"></textarea>
	</div>
	<input type="button" onclick="iniciar()" value="procesar"/>
	<div>
		<h4>Procesadas</h4>
		<div id="muestrasProcesadas">
		</div>
	</div>
`;
