const maxLevelDepth = 2;

document.addEventListener("DOMContentLoaded", function () {
    getListItems(
        document
            .querySelector('[name="dashboard"]')
            .getAttribute("data-first-list-id")
    );

    const todoListItem = document.querySelector(".todo-list");

    // New task
    const todoListInput = document.querySelector(".todo-list-input");
    const todoListAddBtn = document.querySelector(".todo-list-add-btn");

    // New list
    const newListInput = document.querySelector(".add-list-input");
    const newListAddBtn = document.querySelector(".user-list-add-btn");
    const deleteListBtn = document.getElementById("deleteListLabel");

	// New note 
	const noteListItem = document.querySelector(".notes-list");
	const newNoteInput = document.querySelector(".add-note-input");
	const newNoteAddBtn = document.querySelector(".task-note-add-btn");

    todoListAddBtn.addEventListener("click", function (event) {
        addNewTask(null)
            .then(function (task) {
                event.preventDefault();
                console.log("test");
                // var task = todoListInput.value;
                console.log(task);
                if (task) {
                    const listItem = document.createElement("li");
                    listItem.setAttribute("data-task-id", task.id);
                    listItem.setAttribute(
                        "data-parent-task-id",
                        task.parent_task_id
                    );
                    listItem.setAttribute("data-task-depth-level", 0);
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

    newListAddBtn.addEventListener("click", function (event) {
        addNewList()
            .then(function (list) {
                event.preventDefault();
                // --HTML part--
                var dropdownList = document.getElementById("dropdownList");

                // Create a new dropdown item
                var newDropdownItem = document.createElement("a");
                newDropdownItem.classList.add("dropdown-item");
                newDropdownItem.setAttribute("data-list-id", list.id);
                // newDropdownItem.href = "#";
                newDropdownItem.textContent = list.title;
                newDropdownItem.onclick = function () {
                    updateSelectedList(list.title, list.id);
                };

                // Append the new item to the dropdown menu
                dropdownList.appendChild(newDropdownItem);

                // Clear the input field after adding the item
                newListInput.value = "";

                // Make UI visible if not already
                const cardBody = document.querySelector(".card-body");
                console.log(cardBody);
                cardBody.classList.remove("d-none");

                // Check if this is the first element in dropdown menu
                const dropdownMenu = document.querySelector(".dropdown-menu");
                const numberOfChildren = dropdownMenu.children.length;
				console.log("num of lists: ", numberOfChildren);
                if (numberOfChildren == 1) {
                    const dashboard = document.querySelector('[name="dashboard"]');
                    dashboard.setAttribute(
                        "data-first-list-title",
                        list.title
                    );
                    dashboard.setAttribute(
                        "data-first-list-id",
                        list.id
                    );
                }
            })
            .catch(function (error) {
                console.error("Error in addNewList:", error);
            });
    });

	newNoteAddBtn.addEventListener("click", function (event) {
		addNewNote()
			.then(function (note) {
			const notesList = document.getElementById("notesList");
				console.log(note)
				const noteItem = document.createElement("li");
				newNoteInput.value = "";
				noteItem.innerHTML = `
					<li>
						<div class="note-item d-flex justify-content-center" data-note-id="${note.id}">
							<div class="expandable-div" contenteditable="true">${note.content}</div>
							<i class="remove mdi mdi-close-circle-outline" ></i>
						</div>
					</li>
				`;
				notesList.appendChild(noteItem);
			})
			.catch(function (error) {
                console.error("Error in addNewNote:", error);
            });
	});

    todoListItem.addEventListener("change", function (event) { // <---- MARKER: CHANGING DONE STATUS
        var status;
        var checkbox = event.target;
        if (checkbox.checked) {
            checkbox.removeAttribute("checked");
            status = 1; // TRUE
        } else {
            checkbox.setAttribute("checked", "checked");
            status = 0; // FALSE
        }

        var listItem = checkbox.closest("li");
        listItem.classList.toggle("completed");

        const taskId = event.target.parentNode.parentNode.parentNode.getAttribute("data-task-id") 
        console.log(taskId, status);
        updateTaskStatus(taskId, status);
    });

    todoListItem.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("form-open-dialog-label")) { // <---- MARKER: GETTING NOTES
			const listItem = target.parentNode.parentNode;
			const titleItem = target.parentNode;
			console.log(listItem)
            // TODO: Add dialog for opening and adding notes
			openModal(target.textContent, listItem.getAttribute("data-task-id"))
        }

        if (target.classList.contains("remove")) {
            var listItem = target.parentNode.parentNode;
            var depthLevel = listItem.getAttribute("data-task-depth-level");
            if (depthLevel == 0) {
                const taskId = listItem.getAttribute("data-task-id");
                const subTasks = document.querySelectorAll(
                    `[data-parent-task-id="${taskId}"]`
                );

                // Remove each subtask element
                subTasks.forEach((subTask) => {
                    const taskId = subTask.getAttribute("data-task-id");
                    const subTasks = document.querySelectorAll(
                        `[data-parent-task-id="${taskId}"]`
                    );
                    subTasks.forEach((subTask) => {
                        //level 2 deletion
                        subTask.remove();
                    });

                    // level 1 deletion
                    subTask.remove();
                });
            } else if (depthLevel == 1) {
                const taskId = listItem.getAttribute("data-task-id");
                const subTasks = document.querySelectorAll(
                    `[data-parent-task-id="${taskId}"]`
                );

                // Remove each subtask element
                subTasks.forEach((subTask) => {
                    //level 2 deletion
                    subTask.remove();
                });
            }
            deleteTask(listItem.getAttribute("data-task-id"));
            //top level deletion
            listItem.remove();
        }
    });

	noteListItem.addEventListener("click", function (event) {
		var target = event.target;
		const noteItem = target.parentNode.parentNode;
		const noteId = target.parentNode.getAttribute("data-note-id");

		if (target.classList.contains("remove")) {
			console.log(noteItem);
			deleteNote(noteId);
			noteItem.remove();
		}
	});

    deleteListBtn.addEventListener("click", function (event) {
        const currentSelectedList = document
            .getElementById("dropdownList")
            .getAttribute("current-selected");
        deleteList(currentSelectedList);

        // Update UI
        const dashboard = document.querySelector('[name="dashboard"]');
        const firstListTitle = dashboard.getAttribute("data-first-list-title");
        const firstListId = dashboard.getAttribute("data-first-list-id");
        if (currentSelectedList != firstListId) {
            // Set to first list if deleted list is not the first list
            document
                .querySelector(
                    `.dropdown-item[data-list-id="${currentSelectedList}"]`
                )
                .remove();
            updateSelectedList(firstListTitle, firstListId);
        } else {
            // Set to first list that's not the actual first list
            const firstNotActualList = document.querySelector(
                '.dropdown-item:not([data-list-id="' + firstListId + '"])'
            );
            console.log(firstNotActualList);
			document
				.querySelector(
					`.dropdown-item[data-list-id="${firstListId}"]`
				)
				.remove();
            if (firstNotActualList) {
                // List has other elements other than the first list
                const newTitle = firstNotActualList.textContent;
                const newId = firstNotActualList.getAttribute("data-list-id");
                dashboard.setAttribute("data-first-list-title", newTitle);
                dashboard.setAttribute("data-first-list-id", newId);
                updateSelectedList(newTitle, newId);
            } else {
				dashboard.removeAttribute("data-first-list-title")
				dashboard.removeAttribute("data-first-list-id")
				// Set list invisible
				const cardBody = document.querySelector(".card-body");
                cardBody.classList.add("d-none");
				updateSelectedList(null, null);
            }
        }
    });
});

function updateSelectedList(listTitle, listId) {
	if (listTitle) {
		document.getElementById("dropdownMenuButton").innerText = listTitle;
	} else {
		document.getElementById("dropdownMenuButton").innerText = "No lists yet...";
	}
    const dropdown = document.getElementById("dropdownList");
	dropdown.setAttribute("current-selected", listId);
    getListItems(listId);
}

function getListItems(listId) {
    if (listId == null) {
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = ""; // Clear existing tasks
        return;
    }
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
                    listItem.setAttribute(
                        "data-parent-task-id",
                        task.parent_task_id
                    );
                    listItem.setAttribute(
                        "data-task-depth-level",
                        task.task_depth_level
                    );
                    listItem.setAttribute(
                        "class",
                        "ml-" + task.task_depth_level
                    );
                    if (task.finished) {
                        var currentClass = listItem.getAttribute("class");     
                        var newClass = currentClass + " completed";
                        listItem.setAttribute("class", newClass);
                    }
                    //   const parentTask = task.parent_task_id;
                    listItem.innerHTML = `
                        <div class="form-check d-flex justify-content-left">
                            <label class="form-check-label">
                                <input class="checkbox" type="checkbox" ${
                                    task.finished ? `checked="checked"` : ""
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
                        listItem.setAttribute(
                            "data-parent-task-id",
                            task.parent_task_id
                        );
                        listItem.setAttribute(
                            "data-task-depth-level",
                            task.task_depth_level
                        );
                        listItem.setAttribute(
                            "class",
                            "ml-" + (task.task_depth_level * 2 + 1),
                        );
                        if (task.finished) {
                            var currentClass = listItem.getAttribute("class");     
                            var newClass = currentClass + " completed";
                            listItem.setAttribute("class", newClass);
                        }
                        const addSubTaskButtonDisabled = `<i class="add-sub-task-disabled mdi mdi-plus"></i>`;
                        const addSubTaskButton = `<i class="add-sub-task mdi mdi-plus" onclick="addNewSubTask()"></i>`;
                        listItem.innerHTML = `
                            <div class="form-check d-flex justify-content-left">
                                <label class="form-check-label">
                                    <input class="checkbox" type="checkbox" ${
                                        task.finished ? `checked="checked"` : ""
                                    }>
                                    <i class="input-helper"></i>
                                </label>
                                <label class="form-open-dialog-label"">
                                    ${task.task_content}
                                    <i class="input-helper"></i>
                                </label>
                            </div>
                            <div class="task-button-group">
                                ${
                                    i === maxLevelDepth
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
                            parentTask.parentNode.insertBefore(
                                listItem,
                                parentTask
                            );
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

function getTaskNotes(taskId) {
	fetch("/notes/all/" + taskId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
	.then((response) => response.json())
	.then((data) => {
		const notesList = document.getElementById("notesList");
		notesList.innerHTML = ""; // Clear existing notes
		data.forEach((note) => {
			const noteItem = document.createElement("li");
			noteItem.innerHTML = `
				<li>
					<div class="note-item d-flex justify-content-center" data-note-id="${note.note_id}">
						<div class="expandable-div" contenteditable="true">${note.note_content}</div>
						<i class="remove mdi mdi-close-circle-outline" ></i>
					</div>
				</li>
			`;
			notesList.appendChild(noteItem);
		})

	})
	.catch((error) => {
		console.error("Error fetching notes:", error);
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
                listItem.setAttribute(
                    "data-parent-task-id",
                    task.parent_task_id
                );
                // Find the parent task
                const parentTaskId = task.parent_task_id;
                const parentTask = document.querySelector(
                    `[data-task-id="${parentTaskId}"]`
                );
                const parentTaskDepthLevel = parentTask.getAttribute(
                    "data-task-depth-level"
                );
                listItem.setAttribute(
                    "data-task-depth-level",
                    parseInt(parentTaskDepthLevel) + 1
                );
                listItem.setAttribute(
                    "class",
                    "ml-" + ((parseInt(parentTaskDepthLevel) + 1) * 2 + 1)
                );

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
                            ${
                                parseInt(parentTaskDepthLevel) + 1 ===
                                maxLevelDepth
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
    //  Make this return a promise
    return new Promise((resolve, reject) => {
        var newItemTitle = document.getElementById("newListInput").value;
        if (newItemTitle.trim() !== "") {
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
                    updateSelectedList(data.title, data.id);
                    console.log(data);
                    resolve(data);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        } else {
            reject(new Error("Invalid input for new task")); // Reject the promise with an error
        }
    });
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

function addNewNote() {
	return new Promise((resolve, reject) => {
		var newItemContent = document.getElementById("newNoteInput").value;
		const modal = document.getElementById('overlayModal');
		const taskId = modal.getAttribute("data-current-task-id");
		if (newItemContent.trim() !== "") {
			var postData = {
                content: newItemContent,
                task_id: taskId,
            };

			fetch("/notes", {
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

function openModal(taskName, taskId) {
	// Set the dynamic content inside the modal
	const modal = document.getElementById('overlayModal');
	modal.setAttribute("data-current-task-id", taskId);
	const modalTitle = document.getElementById('noteOverlayTitle');
	modalTitle.textContent = "Notes for " + taskName;

	getTaskNotes(taskId);
	// Trigger the modal to show
	$('#overlayModal').modal('show');
}

function updateTaskStatus(taskId, status) {
    var postData = {
        finished: status,
    };

    fetch("/tasks/status/" + taskId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    }) 
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error:", error);
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

function deleteNote(noteId) {
	fetch("/notes/" + noteId, {
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
