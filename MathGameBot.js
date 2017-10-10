// PLEASE ADJUST required_result AND delay VARIABLES ACCORDING TO YOUR PREFERENCES. ENJOY! 
var required_result = 32; // required result for the game
var delay = 100; // delay in ms

var restart = document.getElementById('button_correct');
restart.click();

function runIt() {
  var task_x = +document.getElementById('task_x').innerHTML;
  var task_op = document.getElementById('task_op').innerHTML;
  var task_y = +document.getElementById('task_y').innerHTML;
  var task_res = document.getElementById('task_res').innerHTML;
  
  if (task_op == '+') {
    if (task_x+task_y == task_res) {
      doTrue();
    }else {
      doFalse();
    }
  }
  if (task_op == '–') {
    if (task_x-task_y == task_res) {
      doTrue();
    }else {
      doFalse();
    }
  }
  if (task_op == '/') {
    if (task_x/task_y == task_res) {
      doTrue();
    }else {
      doFalse();
    }
  }
  if (task_op == '×') {
    if (task_x*task_y == task_res) {
      doTrue();
    }else {
      doFalse();
    }
  }
};


for(i = 0; i < required_result; i++){
 setTimeout(function(){runIt()}, i*delay); 
}

function doTrue() {
    document.getElementById('button_correct').click();
};
function doFalse() {
    document.getElementById('button_wrong').click();
};
