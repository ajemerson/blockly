/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Java for text blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.texts');

goog.require('Blockly.Java');


Blockly.Java['text'] = function(block) {
  // Text value.
  var code = Blockly.Java.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Java.ORDER_ATOMIC];
};

/**
 * Enclose the provided value in 'str(...)' function.
 * Leave string literals alone.
 * @param {string} value Code evaluating to a value.
 * @return {string} Code evaluating to a string.
 * @private
 */
Blockly.Java.text.forceString_ = function(value) {
  if (Blockly.Java.text.forceString_.strRegExp.test(value)) {
    return value;
  }
  return 'str(' + value + ')';
};

/**
 * Regular expression to detect a single-quoted string literal.
 */
Blockly.Java.text.forceString_.strRegExp = /^\s*'([^']|\\')*'\s*$/;

Blockly.Java['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  //Should we allow joining by '-' or ',' or any other characters?
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', Blockly.Java.ORDER_ATOMIC];
      break;
    case 1:
      var element = Blockly.Java.valueToCode(block, 'ADD0',
              Blockly.Java.ORDER_NONE) || '\'\'';
      var code = Blockly.Java.text.forceString_(element);
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
      break;
    case 2:
      var element0 = Blockly.Java.valueToCode(block, 'ADD0',
          Blockly.Java.ORDER_NONE) || '\'\'';
      var element1 = Blockly.Java.valueToCode(block, 'ADD1',
          Blockly.Java.ORDER_NONE) || '\'\'';
      var code = Blockly.Java.text.forceString_(element0) + ' + ' +
          Blockly.Java.text.forceString_(element1);
      return [code, Blockly.Java.ORDER_ADDITIVE];
      break;
    default:
      var elements = [];
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.Java.valueToCode(block, 'ADD' + i,
                Blockly.Java.ORDER_NONE) || '\'\'';
      }
      var tempVar = Blockly.Java.variableDB_.getDistinctName('x',
          Blockly.Variables.NAME_TYPE);
      var code = '\'\'.join([str(' + tempVar + ') for ' + tempVar + ' in [' +
          elements.join(', ') + ']])';
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  }
};

Blockly.Java['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var value = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_NONE) || '\'\'';
  return varName + ' = str(' + varName + ') + ' +
      Blockly.Java.text.forceString_(value) + '\n';
};

Blockly.Java['text_length'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '\'\'';
  return ['len(' + text + ')', Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var code = 'not len(' + text + ')';
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  var operator = block.getFieldValue('END') == 'FIRST' ? 'find' : 'rfind';
  var substring = Blockly.Java.valueToCode(block, 'FIND',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var text = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = text + '.' + operator + '(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.Java.ORDER_ADDITIVE];
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var text = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'LAST':
      var code = text + '[-1]';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'FROM_START':
      var at = Blockly.Java.getAdjustedInt(block, 'AT');
      var code = text + '[' + at + ']';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'FROM_END':
      var at = Blockly.Java.getAdjustedInt(block, 'AT', 1, true);
      var code = text + '[' + at + ']';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'RANDOM':
      Blockly.Java.definitions_['import_random'] = 'import random';
      var functionName = Blockly.Java.provideFunction_(
          'text_random_letter',
          ['def ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ + '(text):',
           '  x = int(random.random() * len(text))',
           '  return text[x];']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  }
  throw Error('Unhandled option (text_charAt).');
};

Blockly.Java['text_getSubstring'] = function(block) {
  // Get substring.
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var text = Blockly.Java.valueToCode(block, 'STRING',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  switch (where1) {
    case 'FROM_START':
      var at1 = Blockly.Java.getAdjustedInt(block, 'AT1');
      if (at1 == '0') {
        at1 = '';
      }
      break;
    case 'FROM_END':
      var at1 = Blockly.Java.getAdjustedInt(block, 'AT1', 1, true);
      break;
    case 'FIRST':
      var at1 = '';
      break;
    default:
      throw Error('Unhandled option (text_getSubstring)');
  }
  switch (where2) {
    case 'FROM_START':
      var at2 = Blockly.Java.getAdjustedInt(block, 'AT2', 1);
      break;
    case 'FROM_END':
      var at2 = Blockly.Java.getAdjustedInt(block, 'AT2', 0, true);
      // Ensure that if the result calculated is 0 that sub-sequence will
      // include all elements as expected.
      if (!Blockly.isNumber(String(at2))) {
        Blockly.Java.definitions_['import_sys'] = 'import sys';
        at2 += ' or sys.maxsize';
      } else if (at2 == '0') {
        at2 = '';
      }
      break;
    case 'LAST':
      var at2 = '';
      break;
    default:
      throw Error('Unhandled option (text_getSubstring)');
  }
  var code = text + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.upper()',
    'LOWERCASE': '.lower()',
    'TITLECASE': '.title()'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var text = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.lstrip()',
    'RIGHT': '.rstrip()',
    'BOTH': '.strip()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_print'] = function(block) {
  // Print statement.
  var msg = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_NONE) || '\'\'';
  return 'print(' + msg + ')\n';
};

Blockly.Java['text_prompt_ext'] = function(block) {
  // Prompt function.
  var functionName = Blockly.Java.provideFunction_(
      'text_prompt',
      ['def ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
       '  try:',
       '    return raw_input(msg)',
       '  except NameError:',
       '    return input(msg)']);
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Java.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Java.valueToCode(block, 'TEXT',
        Blockly.Java.ORDER_NONE) || '\'\'';
  }
  var code = functionName + '(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_prompt'] = Blockly.Java['text_prompt_ext'];

Blockly.Java['text_count'] = function(block) {
  var text = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var sub = Blockly.Java.valueToCode(block, 'SUB',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var code = text + '.count(' + sub + ')';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_replace'] = function(block) {
  var text = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var from = Blockly.Java.valueToCode(block, 'FROM',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var to = Blockly.Java.valueToCode(block, 'TO',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var code = text + '.replace(' + from + ', ' + to + ')';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_reverse'] = function(block) {
  var text = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = text + '[::-1]';
  return [code, Blockly.Java.ORDER_MEMBER];
};
