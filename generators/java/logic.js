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
 * @fileoverview Generating Java for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.logic');

goog.require('Blockly.Java');


Blockly.Java['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  do {
    conditionCode = Blockly.Java.valueToCode(block, 'IF' + n,
        Blockly.Java.ORDER_NONE) || 'False';
    branchCode = Blockly.Java.statementToCode(block, 'DO' + n) ||
        Blockly.Java.PASS;
    code += (n == 0 ? 'if ' : 'elif ' ) + conditionCode + ':\n' + branchCode;

    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    branchCode = Blockly.Java.statementToCode(block, 'ELSE') ||
        Blockly.Java.PASS;
    code += 'else:\n' + branchCode;
  }
  return code;
};

Blockly.Java['controls_ifelse'] = Blockly.Java['controls_if'];

Blockly.Java['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Java.ORDER_RELATIONAL;
  var argument0 = Blockly.Java.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Java['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
  var order = (operator == 'and') ? Blockly.Java.ORDER_LOGICAL_AND :
      Blockly.Java.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Java.valueToCode(block, 'A', order);
  var argument1 = Blockly.Java.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'False';
    argument1 = 'False';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'and') ? 'True' : 'False';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Java['logic_negate'] = function(block) {
  // Negation.
  var argument0 = Blockly.Java.valueToCode(block, 'BOOL',
      Blockly.Java.ORDER_LOGICAL_NOT) || 'True';
  var code = 'not ' + argument0;
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'True' : 'False';
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['logic_null'] = function(block) {
  // Null data type.
  return ['None', Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Java.valueToCode(block, 'IF',
      Blockly.Java.ORDER_CONDITIONAL) || 'False';
  var value_then = Blockly.Java.valueToCode(block, 'THEN',
      Blockly.Java.ORDER_CONDITIONAL) || 'None';
  var value_else = Blockly.Java.valueToCode(block, 'ELSE',
      Blockly.Java.ORDER_CONDITIONAL) || 'None';
  var code = value_then + ' if ' + value_if + ' else ' + value_else;
  return [code, Blockly.Java.ORDER_CONDITIONAL];
};
