(function($){

  function trim(el) {
    return $.trim(el.val());
  }

  function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }

  function makeErrorElem(error, config) { //Default error template
    var msgErrorClass = config.errorClass;
    return $('<span class="' + msgErrorClass + '" role="alert">' + error + '</span>');
  }
  
  function makeErrorMessage(field, error){
    var err = rule.error || ('%s is required');
  }

  var defaults = {
    errorClass: 'valiation-error',
    trim: true
  }

  var MESSAGES = {
    number: "%s is not numeric",
    required: "%s is required"
  };

  function Field(name, el, rules, options, validator){
    var self = this;
    var stacks = [];
    this.validator = validator;
    this.name = name;
    this.el = el;
    this.rules = rules;
    this.errors = [];
    
    
    this.add = function(fn){
      stacks.push(fn);
      return this;
    }
    
    this.run = function(){
      errors = [];
      var val;
      if(rules.trim !== false || options.trim !== false){
        val = trim(this.el);
      }else{
        val = el.val();
      }
      stacks.forEach(function(fn){
        var r = fn(val);
        if(!r.valid){
          var label = self.rules.label || self.name;
          errors.push(r.error.replace('%s', label));
        }
      });
      
      validator.errors = errors;
      if(errors.length){
        el.next('.'+options.errorClass).remove();
        el.after(makeErrorElem(errors[0], options));
        return false;
      }else{
        el.next('.'+options.errorClass).remove();
        return true;
      }
    }
    
    //Build validator stack
    for(var key in rules){
      if(isFunction(this[key])){
        this[key].call(this);
      }
    }
    
    el.bind('blur', this.run.bind(this));
    
  }
  
  Field.prototype.required = function(){
    var self = this;
    return this.add(function(value){
      if(value !== undefined && value !== null && value != ""){
        return {valid: true}
      }else{
        var msg = self.rules.error || "%s is required";        
        return {error: msg}
      }
    });
  }
  
  Field.prototype.isEmail = function(){
    var self = this;
    return this.add(function(value){
      if(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value)){
        return {valid: true}
      }else{
        var msg = self.rules.error || "%s is not a valid email";        
        return {error: msg}
      }
    });
  }
  
  Field.prototype.equals  = function(){
    var self = this;
    var target = self.rules.equals.split('::')[1];
    target = $("[name='"+target+"']", self.validator);
    return this.add(function(value){
      if(value == target.val()){
        return {valid: true}
      }else{
        var msg = self.rules.error || ("%s does not match with " + target);        
        return {error: msg}
      }
    })
  }
  
  Field.prototype.minLength = function(){
    var self = this;
    return this.add(function(value){
      if(value >= self.rules.minLength){
        return {valid: true}
      }else{
        var msg = self.rules.error || ("%s must be minimum " + self.rules.minLength + " characters long");        
        return {error: msg}
      }
    });
  }
  
  Field.prototype.maxLength = function(){
    var self = this;
    return this.add(function(value){
      if(value <= self.rules.maxLength){
        return {valid: true}
      }else{
        var msg = self.rules.error || ("%s must be less than " + self.rules.minLength + " characters long");        
        return {error: msg}
      }
    });
  }
  
  Field.prototype.regex = function(){
    var self = this;
    return this.add(function(value){
      var pattern = new RegExp(self.rules.regex);
      if(pattern.test(value, self.rules.modifier)){
        return {valid: true}
      }else{
        var msg = self.rules.error || ("%s does not pass validation rule");        
        return {error: msg}
      }
    });
  }

  
  $.fn.validate = function(config){
    var self = this;
    var fields = [], fieldName;
    var rules = config.rules;

    var options = config.options || {};
    options = $.extend({}, defaults, options);

    //handle form submit
    function handleSubmit(){
      var errors = false;
      for(fieldName in fields){
        var isValid = fields[fieldName].validate();
        if(!isValid) errors = true;
      }
      return !errors;
    }

    
    for(fieldName in rules){
      var el = $("[name='"+fieldName+"']", self);
      if(el){
        fields[fieldName]= new Field(fieldName, el, rules[fieldName], options, self);
      }
    }


    this.bind('submit', handleSubmit);
    
    return this;
  }
}(jQuery))
