/**
 * Created by amitava on 1/15/15.
 */
(function ($) {

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

  var defaults = {
    errorClass: 'validation-error',
    trim: true,
    renderError: true
  };

  function Field(name, el, rules, options, validator) {
    var self = this;
    var stacks = [];
    this.validator = validator;
    this.name = name;
    this.el = el;
    this.rules = rules;
    this.errors = [];
    this.isSelect = el.is('select');
    this.isRadio = (el.attr('type') == 'radio');
    this.isCheckbox = (el.attr('type') == 'checkbox');
    var errorTarget;
    if (el.length > 1) {
      errorTarget = $(el[el.length - 1]);
    } else {
      errorTarget = el;
    }
    if(errorTarget.parent().is('label')){
      errorTarget = errorTarget.parent();
    }

    this.add = function (fn) {
      stacks.push(fn);
      return this;
    }

    this.run = function () {
      var errors = [];
      var val;
      if (self.isCheckbox || self.isRadio) {
        var vals = [];
        el.each(function (i, e) {
          if ($(e).is(':checked')) {
            vals.push($(e).val())
          }
        });
        val = vals.join(',');
      } else {
        if (rules.trim !== false || options.trim !== false) {
          val = trim(this.el);
        } else {
          val = el.val();
        }
      }

      if (rules.filters) {
        rules.filters.forEach(function (filter) {
          if (isFunction($.fn.validate.filters[filter])) {
            val = $.fn.validate.filters[filter].call(self, val);
          }
        })

      }

      stacks.forEach(function (fn) {
        var r = fn(val);
        if (!r.valid) {
          var label = self.rules.label || self.name;
          errors.push(r.error.replace('%s', label));
        }
      });
    

        if (errors.length) {
          if(options.renderError){
            errorTarget.next('span.' + options.errorClass).remove();
            errorTarget.after(makeErrorElem(errors[0], options));
          }
          validator._errors[name] = errors;
          return false;
        } else {
          errorTarget.next('span.' + options.errorClass).remove();
          delete validator._errors[name];
          return true;
        }
    };

    //Build validator stack
    for (var key in rules) {
      if (isFunction(this[key]) && rules[key] !== false) {
        this[key].call(this);
      }
    }
    if (this.isCheckbox || this.isRadio || this.isSelect) {
      el.bind('change', this.run.bind(this));
    } else {
      el.bind('blur', this.run.bind(this));
    }

  }

  Field.prototype.required = function () {
    var self = this;
    return this.add(function (value) {
      if (value !== undefined && value !== null && value != "") {
        return {valid: true}
      } else {
        var msg = self.rules.error || "%s is required";
        return {error: msg}
      }
    });
  };

  Field.prototype.email = function () {
    var self = this;
    emailEx = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    return this.add(function (value) {
      if (emailEx.test(value)) {
        return {valid: true}
      } else {
        var msg = self.rules.error || "%s is not a valid email";
        return {error: msg}
      }
    });
  };

  Field.prototype.equals = function () {
    var self = this;
    var target = self.rules.equals.split('::')[1];
    target = $("[name='" + target + "']", self.validator);
    return this.add(function (value) {
      if (value == target.val()) {
        return {valid: true}
      } else {
        var msg = self.rules.error || ("%s does not match with " + target);
        return {error: msg}
      }
    });
  };

  Field.prototype.minLength = function () {
    var self = this;
    return this.add(function (value) {
      if (value.length >= self.rules.minLength) {
        return {valid: true}
      } else {
        var msg = self.rules.error || ("%s must be minimum " + self.rules.minLength + " characters long");
        return {error: msg}
      }
    });
  };

  Field.prototype.maxLength = function () {
    var self = this;
    return this.add(function (value) {
      if (value.length <= self.rules.maxLength) {
        return {valid: true}
      } else {
        var msg = self.rules.error || ("%s must be less than " + self.rules.maxLength + " characters long");
        return {error: msg}
      }
    });
  };

  Field.prototype.regex = function () {
    var self = this;
    return this.add(function (value) {
      var pattern = new RegExp(self.rules.regex);
      if (pattern.test(value, self.rules.modifier)) {
        return {valid: true}
      } else {
        var msg = self.rules.error || ("%s does not pass validation rule");
        return {error: msg}
      }
    });
  };

  
  $.fn.validate = function (config) {
    var self = this;
    var fields = [], fieldName;
    var rules = config.rules;

    this._errors = {};
    
    self.isValid = function(){
      return Object.keys(self._errors).length === 0;
    }

    var options = config || {};
    options = $.extend({}, defaults, options);

    //handle form submit
    function handleSubmit(e) {
      
      var errors = false;
      //self._errors = {};
      for (fieldName in fields) {
        var isValid = fields[fieldName].run();
        if (!isValid) errors = true;
      }
      
      if(typeof config.onSubmit === 'function'){
        return !!config.onSubmit.call(self, self._errors);
      }else{
        return self.isValid();
      }

      self.data('valid', !errors);
    }


    for (fieldName in rules) {
      var el = $("[name='" + fieldName + "']", self);
      if (el.length) {
        fields[fieldName] = new Field(fieldName, el, rules[fieldName], options, self);
      }
    }


    this.bind('submit', handleSubmit);

    return this;
  };
  $.fn.validate.filters = {
    stripNonNumeric: function(value){
      if(value){
        return value.replace(/[^0-9]+/g, "");
      }else{
        return value;
      }
    }
  };
  
}(jQuery));
