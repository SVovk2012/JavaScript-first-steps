// PLEASE ADJUST required_result AND delay VARIABLES ACCORDING TO YOUR PREFERENCES. ENJOY! 
var required_result = 32; // required result for the game
var delay = 100; // delay in ms.

var restart = document.getElementById('button_correct');
restart.click();

function continueGame() { // function for continuing the game. This function chooses the right result.
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

function stopGame() {  // function for stoping the game. This function chooses the wrong result.
  var task_x = +document.getElementById('task_x').innerHTML;
  var task_op = document.getElementById('task_op').innerHTML;
  var task_y = +document.getElementById('task_y').innerHTML;
  var task_res = document.getElementById('task_res').innerHTML;
  
  if (task_op == '+') {
    if (task_x+task_y == task_res) {
      doFalse();
    }else {
      doTrue();
    }
  }
  if (task_op == '–') {
    if (task_x-task_y == task_res) {
      doFalse();
    }else {
      doTrue();
    }
  }
  if (task_op == '/') {
    if (task_x/task_y == task_res) {
      doFalse();
    }else {
      doTrue();
    }
  }
  if (task_op == '×') {
    if (task_x*task_y == task_res) {
      doFalse();
    }else {
      doTrue();
    }
  }
};


for(i = 0; i < required_result; i++){
 setTimeout(function(){continueGame()}, i*delay); 
}
for(j = 0; j < 3; j++){
setTimeout(function(){stopGame()}, required_result*delay+5);
}

function doTrue() {
    document.getElementById('button_correct').click();
};
function doFalse() {
    document.getElementById('button_wrong').click();
};
