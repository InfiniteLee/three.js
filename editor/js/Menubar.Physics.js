Menubar.Physics = function ( editor ) {

	var NUMBER_PRECISION = 6;

	function parseNumber( key, value ) {

		return typeof value === 'number' ? parseFloat( value.toFixed( NUMBER_PRECISION ) ) : value;

	}
	
	var config = editor.config;

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Physics' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// New

	// Import

	// var form = document.createElement( 'form' );
	// form.style.display = 'none';
	// document.body.appendChild( form );

	// var fileInput = document.createElement( 'input' );
	// fileInput.type = 'file';
	// fileInput.addEventListener( 'change', function ( event ) {

	// 	editor.loader.loadFile( fileInput.files[ 0 ] );
	// 	form.reset();

	// } );
	// form.appendChild( fileInput );

	// var option = new UI.Row();
	// option.setClass( 'option' );
	// option.setTextContent( 'Import' );
	// option.onClick( function () {

	// 	fileInput.click();

	// } );
	// options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Export Collision JSON

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export Collision' );
	option.onClick( function () {

		var object = editor.scene;

		var out = [];
		bfs(object, out);

		console.log(out);

		var output = {
			"scenes": {
				"Root Scene": {
					"shape": out
				}
			}
		};

		output = JSON.stringify(output);
		saveString( output, 'collision.json' );
	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	var validGeometries = ["SphereBufferGeometry", "BoxBufferGeometry", "CylinderBufferGeometry"];

	function bfs(object, out) {
		if (object.geometry && validGeometries.indexOf(object.geometry.type) > -1) {

			var data;
			var parameters = object.geometry.parameters;
			var scale = new THREE.Vector3(); 
			object.getWorldScale(scale);
			var position = new THREE.Vector3();
			object.getWorldPosition(position);
			var quaternion = new THREE.Quaternion();
			object.getWorldQuaternion(quaternion);

			switch (object.geometry.type) {
				case "SphereBufferGeometry":
					data = {
						shape: "sphere",
						radius: parameters.radius * scale.x
 					};
				break;
				case "BoxBufferGeometry":
					data = {
						shape: "box",
						halfExtents: {
							x: parameters.width * scale.x,
							y: parameters.height * scale.y,
							z: parameters.depth * scale.z
						}
					};
				break;
				case "CylinderBufferGeometry":
					data = {
						shape: "cylinder",
						radiusTop: parameters.radiusTop * scale.x,
						radiusBottom: parameters.radiusBottom * scale.x,
						height: parameters.height * scale.y,
						numSegments: parameters.radialSegments
					};
				break;
			}

			data.offset = {
				x: position.x,
				y: position.y,
				z: position.z
			};
			data.orientation = {
				x: quaternion.x,
				y: quaternion.y,
				z: quaternion.z,
				w: quaternion.w
			};
			
			out.push(data);
		}

		for (var i = 0; i < object.children.length; i++) {
			bfs(object.children[i], out);
		}
	}

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename || 'data.json';
		link.click();

		// URL.revokeObjectURL( url ); breaks Firefox...

	}

	function saveArrayBuffer( buffer, filename ) {

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

	return container;

};
