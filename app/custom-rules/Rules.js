import inherits from 'inherits';
import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

export default function CustomRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(CustomRules, RuleProvider);
CustomRules.$inject = [ 'eventBus' ];

CustomRules.prototype.init = function() {
  this.addRule('connection.create', 1100, function(context) {
    var source = context.source,
        target = context.target;

    if (source.type === 'bpmn:StartEvent' && target.type === 'bpmn:EndEvent') {return false;}
  });
};