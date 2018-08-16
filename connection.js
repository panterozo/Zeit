

const { send } = require('micro');
module.exports = function (request, response){
///// Inicio de micro //////


/* Cargando los módulos necesarios */
const fetch = require('node-fetch');
const JSSHA = require('jssha');

// Tiempo Actual
let timeStamp = new Date().getTime() ;

let apiKey = '';
let apiSecretKey = '';

// Creación del objeto SHA512
const shaObj = new JSSHA('SHA-512', 'TEXT');    // según creador del módulo
shaObj.setHMACKey(apiSecretKey, 'TEXT');        // según creador del módulo


let query = {
  query: `{market(code: "CHABTC"){
  lastTrade{
    price
  }
}}
`};


let query1 = {
				query: `{
					market(code: "CHABTC") {
						code 
						name 
						lastTrade {  
  						price  
							__typename
					  } 
						mainCurrency {  
							code 
							units  
							format  
							__typename
					  } 
						secondaryCurrency {  
							code  
							units  
						  format  
							__typename
					 } 
						  releaseDate 
							__typename  
				} 
				marketOrderBook(marketCode:"CHABTC",limit:1) {
					buy {
						limitPrice
					}
					sell {
						limitPrice 
					} 
					spread 
					mid
			  } 
		}`
};

let body = JSON.stringify(query1);               // Convierte un objeto JS en String
shaObj.update(timeStamp + body);                // según creador del módulo
let signature = shaObj.getHMAC('HEX');          // según creador del módulo


/************************/
/****** Funciones *******/
/************************/

// Función asíncrona que envía la consulta y espera la respuesta.
async function sendQuery() {
  try {
    // Se envía la consulta por medio de FETCH. Consulta tipo POST.
		//console.log(body, apiKey, signature, timeStamp);
    let res = await fetch('http://api2.orionx.io/graphql', {
      method: 'POST',
      // Cabecera
      headers: {
        'Content-Type': 'application/json',
        'X-ORIONX-TIMESTAMP': timeStamp,
        'X-ORIONX-APIKEY': apiKey,
        'X-ORIONX-SIGNATURE': signature,
        'Content-Length': body.length,
      },
      // Cuerpo del Mensaje (query)
      body,
    });
    // Se retorna el cuerpo de la respuesta con formato objeto JS.
    return res.json();
  } catch (e) {
    throw(e);
  }
}


// Función principal
async function main() {
  try {
    // Llamando a sendQuery
    let res = await sendQuery();

    //console.log('\n\n*** Respuesta ***');   // Se imprime la respuesta que llega
    //console.log(res.data);
    //console.log("Last Trade: "+res.data.market.lastTrade.price*0.00000001+" BTC");
    //console.log("Limit Buy Price: "+res.data.marketOrderBook.buy[0].limitPrice*0.00000001+" BTC");
    //console.log("Limit Sell Price: "+res.data.marketOrderBook.sell[0].limitPrice*0.00000001+" BTC");


		var lastTrade = res.data.market.lastTrade.price;
		var limitSell = res.data.marketOrderBook.sell[0].limitPrice;
		var limitBuy = res.data.marketOrderBook.sell[0].limitPrice;

		var string = "Last Trade: "+toBTC(lastTrade)+" BTC\n";
    string = string+"Limit Buy Price: "+toBTC(limitBuy)+" BTC\n";
    string = string+"Limit Sell Price: "+toBTC(limitSell)+" BTC";
//console.log(string);
		//var responseOrionX = JSON.stringify(res.data);
		//var replaced = responseOrionX.replace(/{|}/g,"<br>");
		//console.log(replaced);

	  send(response, 200, 'Values Cha!\n\n'+string)
	  //send(response, 200, 'Hello World!<br>'+responseOrionX)
  } catch (e) {
    throw(e);
  }
}

function toBTC(value){
  return value*0.00000001;
}
// Se ejecuta el programa principal
main();
//process.exit(1);

///// Fin de micro //////
}

