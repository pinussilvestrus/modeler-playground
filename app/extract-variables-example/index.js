import {
  getProcessVariables,
  getVariablesForScope,
} from '@bpmn-io/extract-process-variables';

function ExtractVariablesExample(canvas) {
    this.canvas = canvas;
}

ExtractVariablesExample.prototype.getVariables = function() {
    // camunda-bpmn-moddle descriptors has to be provided

    const rootElement = this.canvas.getRootElement();

    const allVariables = getProcessVariables(rootElement.businessObject);
    console.log(allVariables);
    /* 
        [
            {
              "name": "variable1",
              "origin": [ "Task_1" ],
              "scope": "Process_1"
            },
            {
              "name": "variable2",
              "origin": [ "Task_1" ],
              "scope": "Process_1"
            },
            {
              "name": "variable3",
              "origin": [ "Task_2" ],
              "scope": "SubProcess_1"
            }
        ]
    */

    const scopeVariables = getVariablesForScope('Process_1', rootElement.businessObject);
    console.log(scopeVariables);
    /* 
        [
            {
              "name": "variable1",
              "origin": [ "Task_1" ],
              "scope": "Process_1"
            },
            {
              "name": "variable2",
              "origin": [ "Task_1" ],
              "scope": "Process_1"
            }
        ]
    */
}

ExtractVariablesExample.$inject = [ 'canvas' ];

export default {
  __init__: [ 'extractVariablesExample' ],
  extractVariablesExample: [ 'type', ExtractVariablesExample ]
};