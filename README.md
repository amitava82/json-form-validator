# JSON form validator

Simple configuration based form validation for jQuery. Still work in progress. Feature requests & PR wellcomed. Please report any issues.

### How?
Create a form making sure all the fields you want to validate has name attribute. Validator rules are defined using field name of the element. Incude jquery & json-form-validator in your page and then initialize the validator on the form like so:
```
var rules = {
name: {
required: true
},
phone: {
label: "Your telephone" //optional, error message would use this to describe the error. 
required: true,
maxLength: 10,
minLength: 10
},

};
$('#myform').validate({rules: rules});
```
Please check demo.html for more example.

###Supported validations:
Example rule with all the supported validators:
```
{
required: true,
maxLength: 10,
minLength: 1,
filters:["stripNonNumeric"],
regex: "((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%!^&*]).{10,20})",
equals:"field::password"
}
```
By default trim is true. If you don't want to trim certain field, pass `false` to the rule
```
trim: false
```
###Filters
You can run the value through filters. Output of one filter will be passed to next filter and final value will be used for validation. Right one `stripNonNumeric` filter is available.
```
filters:["stripNonNumeric"] // strip non numeric characters from the value
```
####Define your own filter
You can define your own filters after you have loaded validator script.
```
$.fn.validate.filters.stripNonNumeric = function(value){
if(value){
return value.replace(/[^0-9]+/g, "");
}else{
return value;
}
}
```      
### Todo's
- more validators
- rules in element attribute
- events & submit handlers - custom callbacks on form submit
- expose errors
- set the filtered value to form
- can't think of any :(

##License: MIT