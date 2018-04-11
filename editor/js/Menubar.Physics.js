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

	// Add

	var material = new THREE.MeshStandardMaterial();
	material.opacity = 0.5;
	material.transparent = true;

	function updateMesh( mesh, data ) {

		if ( data ) {

			if ( data.hasOwnProperty( 'offset' ) ) {

				mesh.position.copy( data.offset );

			}
			if ( data.hasOwnProperty( 'orientation' ) ) {

				var quat = new THREE.Quaternion();
				quat.copy(data.orientation);
				mesh.setRotationFromQuaternion( quat );

			}

		}

	}

	// Box

	function createBox( data ) {

		var x = 1;
		var y = 1;
		var z = 1;

		if ( data && data.hasOwnProperty( 'halfExtents' ) ) {

			x = data.halfExtents.x * 2;
			y = data.halfExtents.y * 2;
			z = data.halfExtents.z * 2;

		}

		var geometry = new THREE.BoxBufferGeometry( x, y, z, 1, 1, 1 );
		geometry.name = 'CollisionShape';
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Box';

		updateMesh( mesh, data );

		editor.execute( new AddObjectCommand( mesh ) );

	}

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Add Col. Box' );
	option.onClick( function () {

		createBox();

	} );
	options.add( option );

	// Sphere

	function createSphere( data ) {

		var radius = 1;

		if ( data && data.hasOwnProperty( 'radius' ) ) {

			radius = data.radius;

		}
		var geometry = new THREE.SphereBufferGeometry( radius, 8, 6, 0, Math.PI * 2, 0, Math.PI );
		geometry.name = 'CollisionShape';
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Sphere';

		updateMesh( mesh, data );

		editor.execute( new AddObjectCommand( mesh ) );

	}

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Add Col. Sphere' );
	option.onClick( function () {

		createSphere();

	} );
	options.add( option );

	// Cylinder

	function createCylinder( data ) {

		var radiusTop = 1;
		var radiusBottom = 1;
		var height = 1;
		var numSegments = 8;

		if ( data && data.hasOwnProperty( 'radiusTop' ) ) {

			radiusTop = data.radiusTop;

		}
		if ( data && data.hasOwnProperty( 'radiusBottom' ) ) {

			radiusBottom = data.radiusBottom;

		}
		if ( data && data.hasOwnProperty( 'height' ) ) {

			height = data.height;

		}
		if ( data && data.hasOwnProperty( 'numSegments' ) ) {

			numSegments = data.numSegments;

		}

		var geometry = new THREE.CylinderBufferGeometry( radiusTop, radiusBottom, height, numSegments, 1, false, 0, Math.PI * 2 );
		geometry.name = 'CollisionShape';
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Cylinder';

		updateMesh( mesh, data );

		editor.execute( new AddObjectCommand( mesh ) );

	}

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Add Col. Cylinder' );
	option.onClick( function () {

		createCylinder();

	} );
	options.add( option );


	options.add( new UI.HorizontalRule() );

	// Import

	var form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.accept = ".json";
	fileInput.addEventListener( 'change', function ( e ) {

		var fileReader = new FileReader();
		fileReader.onload = function ( e ) {

			var obj = JSON.parse( e.target.result );

			if ( obj.hasOwnProperty( 'scenes' ) ) {

				for ( var key in obj.scenes ) {

					var shapes = obj.scenes[ key ].shape;
					for ( var i = 0; i < shapes.length; i ++ ) {

						switch ( shapes[ i ].shape ) {

							case 'box':
								createBox( shapes[ i ] );
								break;
							case 'sphere':
								createSphere( shapes[ i ] );
								break;
							case 'cylinder':
								createCylinder( shapes[ i ] );
								break;

						}

					}

				}

			}

		};
		fileReader.readAsText( e.target.files[ 0 ] );

		form.reset();

	} );
	form.appendChild( fileInput );

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Import Col. JSON' );
	option.onClick( function () {

		fileInput.click();

	} );
	options.add( option );

	options.add( new UI.HorizontalRule() );

	// Export Collision JSON

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export Col. JSON' );
	option.onClick( function () {

		var object = editor.scene;

		var out = { data: [], sceneName: null };
		parseScene( object, out );

		var output = { "scenes": {} };
		output.scenes[ out.sceneName ] = { "shape": out.data };

		output = JSON.stringify( output );
		saveString( output, 'collision.json' );

	} );
	options.add( option );

	//

	var validGeometries = [ "SphereBufferGeometry", "BoxBufferGeometry", "CylinderBufferGeometry" ];

	function parseScene( object, out ) {

		if ( ! out.sceneName && object !== editor.scene && object.type === "Scene" ) {

			out.sceneName = object.name;

		}

		if ( object.geometry && validGeometries.indexOf( object.geometry.type ) > - 1 && object.geometry.name === 'CollisionShape' ) {

			var data;
			var parameters = object.geometry.parameters;
			var scale = new THREE.Vector3();
			object.getWorldScale( scale );
			var position = new THREE.Vector3();
			object.getWorldPosition( position );
			var quaternion = new THREE.Quaternion();
			object.getWorldQuaternion( quaternion );

			switch ( object.geometry.type ) {

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
							x: parameters.width/2 * scale.x,
							y: parameters.height/2 * scale.y,
							z: parameters.depth/2 * scale.z
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

			out.data.push( data );

		}

		for ( var i = 0; i < object.children.length; i ++ ) {

			parseScene( object.children[ i ], out );

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
