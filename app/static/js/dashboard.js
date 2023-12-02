const maxLevelDepth = 2;

document.addEventListener("DOMContentLoaded", function () {
    getListItems(
        document
            .querySelector('[name="dashboard"]')
            .getAttribute("data-first-list-id")
    );

    var todoListItem = document.querySelector(".todo-list");
    var todoListInput = document.querySelector(".todo-list-input");
    var todoListAddBtn = document.querySelector(".todo-list-add-btn");
    var deleteListBtn = document.getElementById("deleteListLabel");

    todoListAddBtn.addEventListener("click", function (event) {
        console.log("test");
        addNewTask(null)
            .then(function (task) {
                event.preventDefault();
                // var task = todoListInput.value;
                console.log(task);
                if (task) {
                    const listItem = document.createElement("li");
                    listItem.setAttribute("data-task-id", task.id);
                    listItem.setAttribute("data-parent-task-id", task.parent_task_id);
                    listItem.setAttribute("data-task-depth-level", 0)
                    listItem.setAttribute("class", "ml-" + 0);
                    listItem.innerHTML = `
                        <div class="form-check d-flex justify-content-left">
                        <label class="form-check-label">
                            <input class="checkbox" type="checkbox">
                            <i class="input-helper"></i>
                        </label>
                        <label class="form-open-dialog-label">
                            ${task.content}
                            <i class="input-helper"></i>
                        </label>
                        </div>
                        <div class="task-button-group">
                            <i class="add-sub-task mdi mdi-plus" onclick="addNewSubTask()"></i>
                            <i class="remove mdi mdi-close-circle-outline"></i>
                        </div>
                    `;

                    todoListItem.appendChild(listItem);
                    todoListInput.value = "";
                }
            })
            .catch(function (error) {
                console.error("Error in addNewTask:", error);
            });
    });

    todoListItem.addEventListener("change", function (event) {
        var checkbox = event.target;
        if (checkbox.checked) {
            checkbox.removeAttribute("checked");
        } else {
            checkbox.setAttribute("checked", "checked");
        }

        var listItem = checkbox.closest("li");
        listItem.classList.toggle("completed");
    });

    todoListItem.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("form-open-dialog-label")) {
            console.log("pls");
        }

        if (target.classList.contains("remove")) {
            var listItem = target.parentNode.parentNode;
            var depthLevel = listItem.getAttribute("data-task-depth-level");
            // TODO: Fix issue with taskId
            if(depthLevel == 0){
                const taskId = listItem.getAttribute("data-task-id");
                const subTasks = document.querySelectorAll(`[data-parent-task-id="${taskId}"]`);
    
                // Remove each subtask element
                subTasks.forEach(subTask => {
                    
                    const taskId = subTask.getAttribute("data-task-id");
                    const subTasks = document.querySelectorAll(`[data-parent-task-id="${taskId}"]`);
                    subTasks.forEach(subTask => {
                        //level 2 deletion
                        subTask.remove();
                    });

                    // level 1 deletion
                    subTask.remove();
                });
            }
            else if (depthLevel == 1){
                const taskId = listItem.getAttribute("data-task-id");
                const subTasks = document.querySelectorAll(`[data-parent-task-id="${taskId}"]`);
    
                // Remove each subtask element
                subTasks.forEach(subTask => {
                    //level 2 deletion
                    subTask.remove();
                });
            }
            deleteTask(listItem.getAttribute("data-task-id"));
            //top level deletion
            listItem.remove();
        }
    });

    deleteListBtn.addEventListener("click", function(event) {
        const currentSelectedList = document.getElementById("dropdownList").getAttribute("current-selected")
        const firstListTitle = document.querySelector('[name="dashboard"]').getAttribute("data-first-list-title")
        const firstListId = document.querySelector('[name="dashboard"]').getAttribute("data-first-list-id")
        deleteList(currentSelectedList);
        document.querySelector(`.dropdown-item[data-list-id="${currentSelectedList}"]`).remove();
        updateSelectedList(firstListTitle, firstListId);
    });
});

function updateSelectedList(listTitle, listId) {
    document.getElementById("dropdownMenuButton").innerText = listTitle;
    document
        .getElementById("dropdownList")
        .setAttribute("current-selected", listId);
    getListItems(listId);
}

function getListItems(listId) {
    fetch("/tasks/all/" + listId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // Handle the retrieved tasks data
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = ""; // Clear existing tasks
            console.log(data);
            data.forEach((task) => {
                if (task.task_depth_level === 0) {
                    const listItem = document.createElement("li");
                    listItem.setAttribute("data-task-id", task.task_id);
                    listItem.setAttribute("data-parent-task-id", task.parent_task_id);
                    listItem.setAttribute("data-task-depth-level", task.task_depth_level)
                    listItem.setAttribute("class", "ml-" + task.task_depth_level);
                    //   const parentTask = task.parent_task_id;
                    listItem.innerHTML = `
                        <div class="form-check d-flex justify-content-left">
                            <label class="form-check-label">
                                <input class="checkbox" type="checkbox" ${task.completed ? "checked" : ""
                        }>
                                <i class="input-helper"></i>
                            </label>
                            <label class="form-open-dialog-label">
                                ${task.task_content}
                                <i class="input-helper"></i>
                            </label>
                        </div>
                        <div class="task-button-group">
                            <i class="add-sub-task mdi mdi-plus" onclick="addNewSubTask()"></i>
                            <i class="remove mdi mdi-close-circle-outline"></i>
                        </div>
                    `;

                    taskList.appendChild(listItem);
                }
            });

            data.forEach((task) => {
                for (var i = 1; i <= maxLevelDepth; i++) {
                    if (task.task_depth_level === i) {
                        const listItem = document.createElement("li");
                        listItem.setAttribute("data-task-id", task.task_id);
                        listItem.setAttribute("data-parent-task-id", task.parent_task_id);
                        listItem.setAttribute("data-task-depth-level", task.task_depth_level)
                        listItem.setAttribute(
                            "class",
                            "ml-" + (task.task_depth_level * 2 + 1)
                        );
                        const addSubTaskButtonDisabled = `<i class="add-sub-task-disabled mdi mdi-plus"></i>`;
                        const addSubTaskButton = `<i class="add-sub-task mdi mdi-plus" onclick="addNewSubTask()"></i>`;
                        listItem.innerHTML = `
                            <div class="form-check d-flex justify-content-left">
                                <label class="form-check-label">
                                    <input class="checkbox" type="checkbox" ${task.completed ? "checked" : ""
                            }>
                                    <i class="input-helper"></i>
                                </label>
                                <label class="form-open-dialog-label">
                                    ${task.task_content}
                                    <i class="input-helper"></i>
                                </label>
                            </div>
                            <div class="task-button-group">
                                ${i === maxLevelDepth
                                ? addSubTaskButtonDisabled
                                : addSubTaskButton
                            }
                                <i class="remove mdi mdi-close-circle-outline"></i>
                            </div>
                        `;

                        // Find the parent task
                        const parentTaskId = task.parent_task_id;
                        const parentTask = document.querySelector(
                            `[data-task-id="${parentTaskId}"]`
                        );

                        if (parentTask) {
                            // Insert the new task before the parent task
                            parentTask.parentNode.insertBefore(listItem, parentTask);
                        } else {
                            // If the parent task is not found, append it to the taskList
                            // taskList.appendChild(listItem);
                            console.log("Parent task not found.");
                        }
                    }
                }
            });
        })
        .catch((error) => {
            console.error("Error fetching tasks:", error);
        });
}

function addNewSubTask() {
    var target = event.target;
    var listItem = target.parentNode.parentNode;
    
    console.log(listItem.getAttribute("data-task-id"));
    addNewTask(listItem.getAttribute("data-task-id"))
    .then(function (task) {
            var todoListInput = document.querySelector(".todo-list-input");
            // event.preventDefault();
            // var task = todoListInput.value;
            console.log(task);
            if (task) {
                const listItem = document.createElement("li");
                listItem.setAttribute("data-task-id", task.id);
                listItem.setAttribute("data-parent-task-id", task.parent_task_id);
                // Find the parent task
                const parentTaskId = task.parent_task_id;
                const parentTask = document.querySelector(
                    `[data-task-id="${parentTaskId}"]`
                );
                const parentTaskDepthLevel = parentTask.getAttribute('data-task-depth-level')
                listItem.setAttribute("data-task-depth-level", (parseInt(parentTaskDepthLevel) + 1))
                listItem.setAttribute("class", "ml-" + ((parseInt(parentTaskDepthLevel) + 1) * 2 + 1));

                const addSubTaskButtonDisabled = `<i class="add-sub-task-disabled mdi mdi-plus"></i>`;
                const addSubTaskButton = `<i class="add-sub-task mdi mdi-plus" onclick="addNewSubTask()"></i>`;

                listItem.innerHTML = `
                        <div class="form-check d-flex justify-content-left">
                        <label class="form-check-label">
                            <input class="checkbox" type="checkbox">
                            <i class="input-helper"></i>
                        </label>
                        <label class="form-open-dialog-label">
                            ${task.content}
                            <i class="input-helper"></i>
                        </label>
                        </div>
                        <div class="task-button-group">
                            ${(parseInt(parentTaskDepthLevel) + 1) === maxLevelDepth
                        ? addSubTaskButtonDisabled
                        : addSubTaskButton
                    }
                            <i class="remove mdi mdi-close-circle-outline"></i>
                        </div>
                    `;


                todoListInput.value = "";
                if (parentTask) {
                    // Insert the new task before the parent task
                    parentTask.parentNode.insertBefore(listItem, parentTask);
                } else {
                    // If the parent task is not found, append it to the taskList
                    // taskList.appendChild(listItem);
                    console.log("Parent task not found.");
                }
            }
        })
        .catch(function (error) {
            console.error("Error in addNewTask:", error);
        });
}

function addNewList() {
    var newItemTitle = document.getElementById("newListInput").value;
    if (newItemTitle.trim() !== "") {
        // --HTML part--
        var dropdownList = document.getElementById("dropdownList");

        // Create a new dropdown item
        var newDropdownItem = document.createElement("a");
        newDropdownItem.classList.add("dropdown-item");
        // newDropdownItem.href = "#";
        newDropdownItem.textContent = newItemTitle;
        newDropdownItem.onclick = function () {
            updateSelectedList(newItemTitle);
        };

        // Append the new item to the dropdown menu
        dropdownList.appendChild(newDropdownItem);

        // Clear the input field after adding the item
        document.getElementById("newListInput").value = "";

        // --AJAX part--
        var postData = {
            title: newItemTitle,
            user_id: document
                .querySelector('[name="dashboard"]')
                .getAttribute("data-user-id"),
        };

        fetch("/lists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        })
            .then((response) => response.json())
            .then((data) => {
                updateSelectedList(data.title, data.id)
                console.log(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
}

function addNewTask(parentTaskId) {
    return new Promise((resolve, reject) => {
        var newItemContent = document.getElementById("newTaskInput").value;

        if (newItemContent.trim() !== "") {
            var postData = {
                content: newItemContent,
                list_id: document
                    .getElementById("dropdownList")
                    .getAttribute("current-selected"),
                parent_task_id: parentTaskId,
            };

            fetch("/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Server response:", data);
                    console.log("Returned ID:", data.id);
                    resolve(data); // Resolve the promise with the ID
                })
                .catch((error) => {
                    console.error("Error:", error);
                    reject(error); // Reject the promise with the error
                });
        } else {
            reject(new Error("Invalid input for new task")); // Reject the promise with an error
        }
    });
}

function deleteList(listId) {
    fetch("/lists/" + listId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function deleteTask(taskId) {
    fetch("/tasks/" + taskId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
