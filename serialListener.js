
module.exports = serialListener;
var windSpeedValue = 0;
var dummyLoadValue = 1;
var pitchAngleValue = 1;


// var app = require('./app');
var portConfig = require('./portConfig.json');

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
// var SerialPort = require("serialport").SerialPort

var simpleJson = {
  "date": "19/5/2015:16:6:66:666",
  "voltage":     0,
  "current":    6,
  "rpm":    0,
  "power":    0,
  "timestamp": 3125413672,
  "windSpeed": 0,
  "pitchAngle": -10,
  "dummyLoad": 0
 }
console.log('ports ' + portConfig.measurement.port);

	DIserialPort = new SerialPort(portConfig.measurement.port, {
		baudrate: portConfig.measurement.baudrate,
		
		parser: serialport.parsers.readline("EOL"),
	}, function (err) {
		if (err) console.log('Eroror opening measurement  port: ' +  portConfig.measurement.port);
	});

function sleep(time, callback) {
// serialListener.prototype.sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
};


/*
var socketServer;
var socketio = require('socket.io');
socketServer = socketio.listen(app, true);
*/
function serialListener()
{	//
	//
	//http://www.barryvandam.com/node-js-communicating-with-arduino/ 
	//copied from the server.js file
	var receivedData = "";
    var sendData = "";
	var delimiter = "\n";
	
 console.log('serialListenerInit called ');

io = require('socket.io').listen(1337);


console.log('serialListener: setup connection now');

io.sockets.on('connection', function(socket){
	console.log('a user connected');
	console.log('connected socket: '+socket.id);


    socket.on('disconnect', function(){
    console.log('user disconnected');
    console.log('socket disconnected' + socket.id+ " " + socket.disconnected);
  });
  

});

 
   DIserialPort.on("open", function () {
		console.log('serialListener.DIserialPort.on Open ' + portConfig.measurement.port);

        sleep(2000, function() {
		});
		
		serialListener.write('DI', 'AA');

			// serialListener.write('DI', 'AA');

		//asserting();
	});
 
 
			

  }; 
 
 var sendData = '';
 var receivedData = '';
 var chunksIn = 0;
 function handleDIserialPortData(data) {
 
 
    // DIserialPort.on('data', function(data) {
	//		console.log('DataInput : '+data);

		chunksIn = chunksIn+1;
        receivedData += data.toString();

			var jsonOpened = receivedData.indexOf('{');
			var jsonClosed = receivedData.indexOf('}', jsonOpened);

		if( jsonClosed !== -1 && jsonOpened !== -1 ) {
			if ( jsonClosed > jsonOpened ) {
				sendData = receivedData.substring(jsonOpened, jsonClosed+1);
				receivedData = receivedData.substring(jsonClosed+2, receivedData.length);'';
				chunksIn = 0;
			}
		 }
         // send the incoming data to browser with websockets.
		if (sendData.length > 0 ) {
			var now = new Date();
			var formatNow = now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear()+'\:'+now.getHours()+'\:'+now.getMinutes()+'\:'+now.getSeconds()+'\:'+now.getMilliseconds();
		
		/* use the same calculation for changin wind speed % to a m/s value
			this is from windsock.ejs. 
			Not the best I know, but hope it works, otherwise windSpeedValue was a percentage...
		*/
		var windSpeedValueText = reutrnWindSpeed(windSpeedValue);

		/* do the same for the pitch angle.
		*/
		var pitchAngleValueText = returnPitchAngle(pitchAngleValue);
		
		/* and dummy load
			NOTE, the magic number 201 is from DLnumFrames in the dummyLoad.ejs file
		*/
		var dummyLoadValueText = returnDummyLoad(dummyLoadValue);
		
			// console.log('SEND update data : '+sendData);
			
			//start with the date
			var sendJSON = '{\n  \"date\": \"'+formatNow+'\",';
			// put in the JSON from the serial input next
			sendJSON += sendData.substring(1, sendData.length-3);
			// now add the info local to the interface, wind speed, pitch angle and dummy load
			sendJSON += ",\n  \"windSpeed\": "+windSpeedValueText+",\n";
			sendJSON += "  \"pitchAngle\": "+pitchAngleValueText+",\n";
			sendJSON += "  \"dummyLoad\": "+dummyLoadValueText+"\n";
			sendJSON += "}";
			
			// have to parse the string sendJSON to a JSON object in order to adjust RPM
			dataItem = JSON.parse(sendJSON);
			
			// adjust RPM due to Arduino issues.
			dataItem.rpm = Math.floor(dataItem.rpm / 1000);

		// console.log( "serialListener send JSON : \n"+sendJSON);
	
			// have to put JSON dataItem back into a string to send properly, why things cannot handle JSON objects???
			io.emit('updateData', JSON.stringify(dataItem));

			sendJSON = null;
			sendData = null;
			dummyLoadValueText = null;
			pitchAngleValueText = null;
			windSpeedValueText = null;
			now = null;
			receivedData = null;
			jsonClosed = null;
			jsonOpened = null;
			
			// console.log("in SerialListener: the wind speed: "+windSpeedValue);
			// console.log("in SerialListener: the pitch angle: "+pitchAngleValue);
			// console.log("in SerialListener: the dummy load: "+dummyLoadValue);


		};
	}; 
 
 process.on('message', function(m) {
	console.log('serialListener got message '+m);
	serialListener();
});

process.on('interfaceData', function(idata) {
	console.log('serialListener got interface message '+idata);
});
   
DIserialPort.on('data', handleDIserialPortData) ;



serialListener.doSomething = function() {
	console.log('serialListener.doSomething here');
};

// function write (id, value) {
serialListener.write = function( id, value ) {
	console.log('serialListener write value: '+value);

     sleep(200, function() {
    }); 
	
	console.log('serialListener write value: '+value);
	if (id === 'DI') {
		console.log('DIserialListener.write '+value);

		DIserialPort.write(value, function(err, results) {
			console.log('DI_err ' + err);
			console.log('DI_results ' + results);
		});
	} else {
		console.log('bad id '+id);
	};
	

};

function asserting() {
  console.log('asserting');
	DIserialPort.set({rts:true, dtr:true}, function(err, something) {
	  console.log('DLserialPort asserted');
		setTimeout(clear, 250);
	});
}

function clear() {
	console.log('clearing');
	DIserialPort.set({rts:false, dtr:false}, function(err, something) {
	  console.log('DLserialPort clear');
		setTimeout(done, 50);
	});
}

function done() {
	console.log("DLserialPort done resetting");
}

function reutrnWindSpeed( windSpeedValueIn ) {
		var windSpeedValueText = (windSpeedValueIn*0.1456)-0.5523;
		windSpeedValueText =  +(Math.round(windSpeedValueText +"e+1")+"e-1");
		if ( windSpeedValueText < 0 ) {
			windSpeedValueText = 0;
		}		
		return windSpeedValueText;
}		

function returnPitchAngle( pitchAngleIn ) {
	return  (pitchAngleIn-101)/10;
}

function returnDummyLoad( dummyLoadIn ) {
	var dummyLoadValueText = ((dummyLoadValue-1)/201)*100;
		dummyLoadValueText =  +(Math.round(dummyLoadValueText +"e+1")+"e-1");
	return dummyLoadValueText;
}
