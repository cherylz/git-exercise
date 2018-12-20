var httpRequest = new XMLHttpRequest();

var updateTodoEdited = function (targetNode) {
  httpRequest.onload = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log('The todo content is modified.', httpRequest.responseText); // Question: How to prevent duplicate PUT requests to the server and duplicate work in the broswer when the event is updated via Enter key and then loses focus (i.e. blurs)?
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function() {
    console.log(httpRequest.statusText);
  }
  var input = targetNode.value; // Question: Is it needed and if yes, how to set a if statement so when the input remains the same, the value won't be updated?
  targetNode.setAttribute('value', input);
  var id = targetNode.parentElement.parentElement.getAttribute("data-todoid");
  httpRequest.open('PUT', 'https://altcademy-to-do-list-api.herokuapp.com/tasks/' + id + '?api_key=52');
  httpRequest.setRequestHeader("Content-Type", "application/json");
  httpRequest.send(JSON.stringify({
    task: {
      content: input
    }
  }));
};

// Update an edited todo item when the item is not focused
var editTodoWhenBlur = function () {
  var editTodo = document.querySelectorAll('.edit-content');
  for (var i = 0; i < editTodo.length; i++) {
    editTodo[i].addEventListener('blur', function (event) {
      updateTodoEdited(event.target);
    });
  }
};

var renderTodoItem = function (id, status, content) {
  var todoGroup = document.querySelector('#todo-group');
  var newTodo = document.createElement('div');
  newTodo.setAttribute('class', 'todo-item-wrapper');
  newTodo.setAttribute('data-todoid', id);
  newTodo.setAttribute('data-completed', status);
  var html = '<input type="checkbox">' + '<span></span>' + '<p class="todo-content"><input type="text" class="edit-content" value="' + content + '" required/></p>' + '<div class="remove"><i class="far fa-trash-alt"></i></div>';
  newTodo.innerHTML = html;
  todoGroup.appendChild(newTodo);
  editTodoWhenBlur();
  // Style the completed todo items.
  if (status) {
    newTodo.querySelector('input[type="checkbox"]').checked = true;
    newTodo.querySelector('span').setAttribute('class', 'custom-checkbox');
    newTodo.querySelector('.edit-content').style.textDecoration = 'line-through';
  }
};

var renderTodoList = function () {
  httpRequest.onload = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log('Todo list retrieved from the server.', httpRequest.responseText);
        var todoGroup = document.querySelector('#todo-group');
        while (todoGroup.firstChild) {
          todoGroup.removeChild(todoGroup.firstChild);
        }
        var todoListFromServer = JSON.parse(httpRequest.responseText)["tasks"];
        // Sort the todo items by id.
        todoListFromServer.sort(function (a, b) {
          return a.id - b.id;
        });
        todoListFromServer.forEach(function (item) {
          renderTodoItem(item.id, item.completed, item.content);
        });
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function() {
    console.log(httpRequest.statusText);
  }
  httpRequest.open('GET', 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=52');
  httpRequest.send();
};

// Add a new task.
var addTodo = function () {
  var todoGroup = document.querySelector('#todo-group');
  var addSection = document.querySelector('#add-todo');
  var input = addSection.querySelector('input').value;
  // TBC: add fallback for input that contains elements like <textarea> and <input>.
  httpRequest.onload = function () {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log('This new todo is stored in the server.', httpRequest.responseText);
        // To render this new todo item & to store extra info (id, completion status) about it.
        var todoItemFromServer = JSON.parse(httpRequest.responseText)["task"];
        renderTodoItem(todoItemFromServer.id, todoItemFromServer.completed, todoItemFromServer.content);
        addSection.querySelector('input').value = '';
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function () {
    console.log(httpRequest.statusText);
  }
  if (input) {
    httpRequest.open('POST', 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=52');
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.send(JSON.stringify({
      task: {
        content: input
      }
    }));
  }
};

var markComplete = function (targetNode) {
  httpRequest.onload = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        targetNode.parentElement.setAttribute('data-completed', 'true');
        targetNode.parentElement.querySelector('span').setAttribute('class', 'custom-checkbox');
        targetNode.parentElement.querySelector('.edit-content').style.textDecoration = 'line-through';
        console.log('This todo is marked as completed', httpRequest.responseText);
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function() {
    console.log(httpRequest.statusText);
  }
  var id = targetNode.parentElement.getAttribute("data-todoid");
  httpRequest.open('PUT', 'https://altcademy-to-do-list-api.herokuapp.com/tasks/' + id + '/mark_complete?api_key=52');
  httpRequest.send();
};

var markActive = function (targetNode) {
  httpRequest.onload = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log('This task is marked as active', httpRequest.responseText);
        targetNode.parentElement.setAttribute('data-completed', 'false');
        targetNode.parentElement.querySelector('span').removeAttribute('class');
        targetNode.parentElement.querySelector('.edit-content').style.textDecoration = '';
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function() {
    console.log(httpRequest.statusText);
  }
  var id = targetNode.parentElement.getAttribute("data-todoid");
  httpRequest.open('PUT', 'https://altcademy-to-do-list-api.herokuapp.com/tasks/' + id + '/mark_active?api_key=52');
  httpRequest.send();
};

var deleteTodo = function (targetNode) {
  httpRequest.onload = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log('The task is deleted.', httpRequest.responseText);
        document.querySelector('#todo-group').removeChild(targetNode.parentElement.parentElement);
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function() {
    console.log(httpRequest.statusText);
  }
  var id = targetNode.parentElement.parentElement.getAttribute("data-todoid");
  httpRequest.open('DELETE', 'https://altcademy-to-do-list-api.herokuapp.com/tasks/' + id + '?api_key=52');
  httpRequest.send();
}

var showActive = function () {
  httpRequest.onload = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log('Active todos.', httpRequest.responseText);
        var todoGroup = document.querySelector('#todo-group');
        while (todoGroup.firstChild) {
          todoGroup.removeChild(todoGroup.firstChild);
        }
        var todoListFromServer = JSON.parse(httpRequest.responseText)["tasks"];
        todoListFromServer.sort(function (a, b) {
          return a.id - b.id;
        });
        todoListFromServer.forEach(function (item) {
          if (!item.completed) {
            renderTodoItem(item.id, item.completed, item.content);
          }
        });
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function() {
    console.log(httpRequest.statusText);
  }
  httpRequest.open('GET', 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=52');
  httpRequest.send();
};

var showCompleted = function () {
  httpRequest.onload = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log('Completed todos.', httpRequest.responseText);
        var todoGroup = document.querySelector('#todo-group');
        while (todoGroup.firstChild) {
          todoGroup.removeChild(todoGroup.firstChild);
        }
        var todoListFromServer = JSON.parse(httpRequest.responseText)["tasks"];
        todoListFromServer.sort(function (a, b) {
          return a.id - b.id;
        });
        todoListFromServer.forEach(function (item) {
          if (item.completed) {
            renderTodoItem(item.id, item.completed, item.content);
          }
        });
      } else {
        console.log(httpRequest.statusText);
      }
    }
  }
  httpRequest.onerror = function() {
    console.log(httpRequest.statusText);
  }
  httpRequest.open('GET', 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=52');
  httpRequest.send();
}


document.addEventListener('DOMContentLoaded', function() {

  renderTodoList();

  var filter = document.querySelector('#filter');
  var todoGroup = document.querySelector('#todo-group');
  var addSection = document.querySelector('#add-todo');

  filter.querySelector('.all-btn').addEventListener('click', function () {
    renderTodoList();
  });

  filter.querySelector('.active-btn').addEventListener('click', function () {
    showActive();
  });

  filter.querySelector('.completed-btn').addEventListener('click', function () {
    showCompleted();
  });

  // Update an edited todo item when the Enter key is pressed on that item
  todoGroup.addEventListener('keyup', function (event) {
    if (event.target.className == 'edit-content' && event.key == 'Enter') {
      updateTodoEdited(event.target);
    }
  });

  // Add a todo item via two ways
  addSection.addEventListener('click', function (event) {
    if (event.target.className == 'fas fa-plus-circle') {
      addTodo();
    }
  });
  addSection.addEventListener('keyup', function (event) {
    if (event.key == 'Enter') {
      addTodo();
    }
  });

  // Mark complete or active
  todoGroup.addEventListener('click', function (event) {
    if (event.target.type == 'checkbox') {
      if (event.target.checked == true) {
        markComplete(event.target);
      } else {
        markActive(event.target);
      }
    }
  });

  // Remove a todo item
  todoGroup.addEventListener('click', function (event) {
    if (event.target.parentElement.matches('.remove')) {
      deleteTodo(event.target);
    }
  });
});

/** Important Question: Why is it called more than one time every time the target is blurred and why does the number of calls keep adding up by one?
todoGroup.addEventListener('blur', function (event) {
  console.log(event.target.className);
  if (event.target.className == 'edit-content') {
      console.log('trees');
  }
});
*/
