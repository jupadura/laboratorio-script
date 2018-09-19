var elementos = {
	filtroCodigo: '[id="form1:j_id68"]',
	filtroBotonBuscarCodigo: '[id="form1:j_id70"]',
	valor: '[id="form1:j_id179"]',
	observacion: '[id="form1:j_id192"]',
	estado: '[id="form1:j_id197"]',
	guardar: '[id="form1:j_id203"]',
	agregarParametro: '[id="form1:tblListaDatos_SeguimientoAnalisis:j_id149"]',
	filas: '[id="form1:tblListaDatos_ParametrosAnalista"] .iceRowSel'
};

var codigosEstados = {
	1: 'No asignado',
	2: 'En espera',
	3: 'En análisis',
	4: 'Revisión calidad',
	5: 'Rechazado',
	6: 'Análisis posterior calidad',
	7: 'Finalizado'
};

var coloresEstados = [
	'#909090',
	'orange',
	'#3270e2;',
	'#9d00ff',
	'red',
	'#0098b1',
	'#0cb119'
];

var iniciar = () => {
	var actualizarMuestra = muestras => {		
		var properties = String(muestras.pop()).split(';');
		if (properties.length >= 4) {
			var codigo = properties[0].trim();
			var tipo = properties[1].trim();
			var estado = properties[2].trim();
			var valor = properties[3].trim();
			var observacion = properties[4] ? properties[4].trim() : '';
			var id = 'id' + (Math.random() + Date()).replace(/[\W]/g, '');
			var tdStyle = 'style="border-bottom: 1px solid black;word-break: break-word;padding: 5px 10px; 5px 0px"';
			document.querySelector('#muestrasProcesadas').innerHTML += `
				<tr 
					id="${id}"
					style="background-color: #c1e6ff;"
				>
					<td ${tdStyle}>${codigo}</td> 
					<td ${tdStyle}>${tipo}</td> 
					<td ${tdStyle}>${codigosEstados[estado]}</td> 
					<td ${tdStyle}>${valor}</td> 
					<td ${tdStyle}>${observacion}</td>
					<td ${tdStyle}>Procesando</td>
				</tr>
			`;
			
			var ventana = window.open(window.location.href, '', 'fullscreen=no');
			ventana.alert = mensaje => {
				ventana.close();
				document.querySelector(`#${id}`).style.backgroundColor = '#96eda8';
				document.querySelector(`#${id} td:last-child`).textContent = mensaje;
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
				getElement(elementos.filtroCodigo).value = codigo;
				getElement(elementos.filtroBotonBuscarCodigo).click();
				return new Promise(resolve => existElement(resolve, elementos.filas));
			};
		
			var seguimientoMuestra = element => {
				var botonSeguimiento = 'td:nth-child(11) a';
						
				element.querySelector(botonSeguimiento).click();
				var promise = new Promise(resolve => existElement(resolve, elementos.agregarParametro));
				promise.then(botonAgregarParametro => {
					botonAgregarParametro.click();
					return new Promise(resolve => existElement(resolve, elementos.valor));
				}).then(inputResultado => {
					inputResultado.value = valor;
					getElement(elementos.observacion).value = observacion;
					getElement(elementos.estado).value = estado;
					getElement(elementos.guardar).click();
				})
			};

			
			new Promise(resolve => existElement(resolve, elementos.filtroCodigo))
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
	<div style="font-family: sans-serif;">
		<div style="display: flex; flex-direction: horizontal">
			<div style="flex-grow: 1; margin-right: 30px;">
				<div style="font-size: 13px;font-weight: bold;list-style: none;padding: 0px;">
					CODIGO;PARAMETRO;ESTADO;VALOR[;OBSERVACION]
				</div>
				<textarea 
					id="muestrasCSV"
					rows="20" 
					style="width:100%" 
				></textarea>
				<input 
					type="button" 
					onclick="iniciar()" 
					value="PROCESAR"
					style="width:100%;background-color: #399fe4;color: white;height: 35px;border: 1px solid #037cce;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px; cursor: pointer;"
				/>

				<ul style="font-size: 13px;font-weight: bold;list-style: none;padding: 0px;">
					<li style="font-weight: bold;">Estados validos</li>
					${coloresEstados.map((color, indice) => `
						<li style="color:${color}">
							<strong>${indice + 1}</strong> - ${codigosEstados[indice + 1]}
						</li>
					`).join('')}
				</ul>

				<div style="font-family: monospace; font-size: 13px;">
					Version 3
				</div>
			</div>
			<div style="flex-grow: 1;">
				<table cellspacing="0px">
					<thead style="font-size: 12px;">
						<tr>
							<th style="padding-right: 10px">CODIGO</th>
							<th style="padding-right: 10px">PARAMETRO</th>
							<th style="padding-right: 10px">ESTADO</th>
							<th style="padding-right: 10px">VALOR</th>
							<th style="padding-right: 10px">OBSERVACION</th>
							<th style="padding-right: 10px">ESTADO REGISTRO</th>
						</tr>
					</thead>	
					<tbody 
						id="muestrasProcesadas"
						style="font-size: 12px;"
					></tbody>
				</table>
			</div>
		</div>
	</div>
`;