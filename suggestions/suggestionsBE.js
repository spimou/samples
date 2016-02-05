/*
What on God's green earth is ILIKE? 
"The key word ILIKE can be used instead of LIKE to make the match case-insensitive according to the active locale. 
This is not in the SQL standard but is a PostgreSQL extension."
see http://www.postgresql.org/docs/8.3/static/functions-matching.html
*/

//get the identifier and call the right function
connection.on('message', function(msg) {	
	var j = JSON.parse(msg.utf8Data);
	switch (packet['command']) {
		case 'typeLookUp':typeLookUp(j['typeToLook'], j['counter']) ;break;
		case 'typeSave':typeSave(j['id'],j['name']) ;break;
	}			
});



function typeLookUp(typeLookUp,counter){	
  var query = client.query("SELECT id, name FROM type  WHERE name ILIKE $1 ",['%'+typeLookUp+'%'])
		  var tid=[];  var tname=[];  
		  query.on("row", function (row, result) {result.addRow(row);});
		  query.on("end", function (result){ 
				   for (var i=0; i<result.rows.length; i++){
					   tid.push(result.rows[i].id);   
					   tname.push(result.rows[i].name);		 
				   }
			connection.send(JSON.stringify({ tid:tid,tname:tname,counter:counter}));				
			client.end();
	});	
}


function typeSave(id,name) {
	  var tname; 
	  var query = client.query("SELECT name FROM type  WHERE name = $1 ",[name]) 
		  query.on("row", function (row, result) {result.addRow(row);});
		  query.on("end", function (result){ 
				   if(result.rows.length!==0){//already exists, so return to stop execution and close
			   			client.end();
						return connection.send("a");
				   }
			tname = result.rows[0].name;
			client.end();
	});	
	
	/* if id = 0 it never changed, so you did not pick/edited something existing, so insert the new thingy - 
	if != 0 you picked something existing that has an id, so update */
	if(id==0){
		var queryIn=client.query('INSERT INTO type (name) VALUES($1) ',[tname], function(err, result) {
				 if(err){console.log(err)}
				 else {
					connection.send("s");
				 }
		});
		queryIn.on("end", function (result) {client.end();});								  			  			
	}
	else{
		var query=client.query('UPDATE type SET name=$1 WHERE id = $2 ',[tname, id])
			query.on("row", function (row, result) {
			result.addRow(row);
		});
		query.on("end", function (result) {
			connection.send("s");
			client.end();
		});
	}
	
}


