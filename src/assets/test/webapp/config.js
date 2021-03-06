requirejs.config({
    paths: {
        text: 'libs/require_text',
        shader: 'require_shader',
        Ember: "libs/ember.min",
        EmberData: "libs/ember-data.min",
        Handlebars: "libs/handlebars-v1.3.0",
        jQuery: "libs/jquery-1.11.1.min",
        THREE: 'libs/threejs/three-depthtextures',
        TWEEN: 'libs/threejs/tween.min',
        ace: 'libs/ace/src-noconflict/ace',
        RSVP: 'libs/rsvp-latest',
        clipper: 'libs/clipper_unminified',
        canvg: 'libs/canvg/canvg',
        bootstrap: 'libs/bootstrap/js/bootstrap.min',
        base64: 'libs/deflate/base64',
        Piecon: 'libs/piecon.min',
        Sortable: 'libs/Sortable.min',
        SVG: 'libs/svg'
    },
    shim: {
        jQuery: {exports: '$'},
        bootstrap: { deps: ['jQuery'] },
        'libs/jquery.mousewheel': {deps: ["jQuery"]},
        Ember: {
            deps: ["jQuery", "Handlebars"],
            exports: "Ember"
        },
        canvg: {deps: ["libs/canvg/rgbcolor.js"], exports: "canvg"},
        EmberData: {deps: ["Ember"], exports: "DS"},
        THREE: {exports: 'THREE'},
        TWEEN: {exports: 'TWEEN'},
        'libs/threejs/OrbitControls': {deps: ['THREE'], exports: 'THREE.OrbitControls'},
        'libs/threejs/TrackballControls': {deps: ['THREE'], exports: 'THREE.TrackballControls'},
        'libs/threejs/CSS3DRenderer': {deps: ['THREE'], exports: 'THREE.CSS3DRenderer'},
        'libs/threejs/STLLoader': {deps: ['THREE'], exports: 'THREE.STLLoader'},
        'libs/threejs/SubdivisionModifier': {deps: ['THREE'], exports: 'THREE.SubdivisionModier'},
        'libs/threejs/postprocessing/EffectComposer': {deps: ['THREE',
            'libs/threejs/postprocessing/CopyShader',
            'libs/threejs/postprocessing/ShaderPass',
            'libs/threejs/postprocessing/MaskPass'],
            exports: 'THREE.EffectComposer'},
        'libs/threejs/postprocessing/RenderPass': {deps: ['THREE'], exports: 'THREE.RenderPass'},
        'libs/threejs/postprocessing/ShaderPass': {deps: ['THREE'], exports: 'THREE.ShaderPass'},
        'libs/threejs/postprocessing/CopyShader': {deps: ['THREE'], exports: 'THREE.CopyShader'},
        'libs/threejs/postprocessing/MaskPass': {deps: ['THREE'], exports: 'THREE.MaskPass'},
        ace: {exports: 'ace'},
        'libs/svg-parser': {deps: ['libs/svg']},
        'libs/svg-import': {deps: ['libs/svg', 'libs/svg-parser']},
        'libs/svg.draggable': {deps: ['libs/svg', 'libs/svg.draggable']},
        RSVP: {exports: 'RSVP'},
        templates: {deps: ['Ember']},
        clipper: {exports: 'ClipperLib'},
        base64: {exports: 'Base64'},
        Piecon: {exports: 'Piecon'}
    }
});
