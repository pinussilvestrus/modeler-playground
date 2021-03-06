import $ from 'jquery';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import CamundaBpmnModdle from "camunda-bpmn-moddle/resources/camunda.json";

import {
  getBusinessObject,
} from 'bpmn-js/lib/util/ModelUtil';

import customRuleModules from './custom-rules';

import readOnlyModule from './readOnly';

import extractVariablesExampleModule from './extract-variables-example';

// import frameOutlineModule from 'diagram-js-frame-outline';

import cursorDebugModule from 'diagram-js-cursor-debug';

import diagramXML from '../resources/newDiagram.bpmn';

var container = $('#js-drop-zone');

var modeler = new BpmnModeler({
  container: '#js-canvas',
  keyboard: {
    bindTo: document
  },
  additionalModules: [
    //customRuleModules,
    //frameOutlineModule,
    // cursorDebugModule,
    extractVariablesExampleModule
    //readOnlyModule

  ],
  moddleExtensions: {
    camunda: CamundaBpmnModdle
  }
});

var eventBus = modeler.get('eventBus');

function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(xml) {

  modeler.importXML(xml, function(err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }

    eventBus.on('drag.start', function(event) {
      console.log('dragging start');
    });

    eventBus.on('drag.init', function(event) {
      console.log('dragging init');
    });

    eventBus.on('drag.end', function(event) {
      console.log('dragging end');
    });

    var canvas = modeler.get('canvas'),
        moddle = modeler.get('moddle'),
        modeling = modeler.get('modeling'),
        extractVariablesExample = modeler.get('extractVariablesExample'),
        elementRegistry = modeler.get('elementRegistry'),
        overlays = modeler.get('overlays'),
        connector = moddle.create('bpmn:Event'),
        definitions = modeler.getDefinitions(),
        extensionElements = moddle.create('bpmn:ExtensionElements');
    
      // extensionElements.$parent = definitions;
      // extensionElements.values = [ connector ];

      // overlays.add('StartEvent_1', { html: (<div>Test</div >), position: {top: 0} })

      // canvas.removeShape(elementRegistry.get('Group'))
      // // modeling.removeShape(elementRegistry.get('Group'));

      // definitions.extensionElements = extensionElements;

      extractVariablesExample.getVariables();

  });

}

function createParticipant() {
  var elementFactory = modeler.get('elementFactory'),
    modeling = modeler.get('modeling'),
    canvas = modeler.get('canvas');

  var parent = canvas.getRootElement(),
    participant1 = elementFactory.createParticipantShape(),
    participant2 = elementFactory.createParticipantShape();

  participant1.businessObject.name = 'A';
  participant2.businessObject.name =  'B';

  modeling.createShape(participant1, { x: 350, y: 200 }, parent);

  // turned into collaboration
  parent = canvas.getRootElement();

  modeling.createShape(participant2, { x: 350, y: 500 }, parent);
}

function saveSVG(done) {
  modeler.saveSVG(done);
}

function saveDiagram(done) {

  modeler.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);

  var eventBus = modeler.get('eventBus');

  eventBus.on('element.dblclick', 10000, function(context) {
    var element = context.element,
      businessObject = element.businessObject;
  
    if (businessObject.name === 'aaaa') {
      return false; // will cancel event
    }
  });
});



// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}