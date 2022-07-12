const taskViewDiv = document.getElementById("leftbox");
const textAreaDiv = document.getElementById("rightbox");
const textArea = document.getElementById("text_ele");
let questions = [];

textArea.addEventListener("keydown", (event) =>{
    if(event.key == "Enter")
    {
        event.preventDefault();
        let task = textArea.value.toString().trim();

        if(checkup(task))
        {
            addTasksToList(task);
            textArea.value = "";
        }

        save();
    }
});

function addTasksToList(task)
{
     questions.push(task);
     showTask(task);
}

function showTask(task)
{
    const taskContainer = document.createElement("div");
    const textContainer = document.createElement("p");
    const checkBox = document.createElement("input");
    const editButton = document.createElement("i");
    const removeButton = document.createElement("i");
    
    if(task.startsWith("<del>"))
    {
        checkBox.checked = true;
    }
    
    textContainer.innerHTML = task;

    let textStriker_obj = {textEle: textContainer, checkEle: checkBox};
    checkBox.type = "checkbox";
    checkBox.addEventListener("click", textStriker.bind(textStriker_obj));

    let editText_obj = {textEle: textContainer, checkBox: checkBox
        , editButton: editButton};

    editButton.className = "material-icons";
    editButton.innerHTML = "create";
    editButton.addEventListener("click", editText.bind(editText_obj));

    let removeTask_obj = {task: taskContainer, text: textContainer, checkBox: checkBox,
                editButton: editButton, removeButton: removeButton};

    removeButton.className = "material-icons";
    removeButton.innerHTML = "delete_forever";
    removeButton.addEventListener("click", removeTask.bind(removeTask_obj));

    taskContainer.appendChild(textContainer);
    taskContainer.appendChild(checkBox);
    taskContainer.appendChild(editButton);
    taskContainer.appendChild(removeButton);

    taskViewDiv.appendChild(taskContainer);

}


function textStriker()
{
    if(this.checkEle.checked)
    {
        let temp = "<del> " + this.textEle.innerHTML + " </del>";
        replaceTask(this.textEle.innerHTML, temp);
        this.textEle.innerHTML = temp;
    }
    else
    {
        let temp = this.textEle.innerHTML.toString().replace("<del>", "")
        .toString().replace("</del>", "");

        replaceTask(this.textEle.innerHTML, temp);

        this.textEle.innerHTML = temp;
    }

    save();
}

function removeTask()
{
   removeEleFromTask(this.text.innerHTML);

    this.removeButton.remove();
    this.editButton.remove();
    this.checkBox.remove();
    this.text.remove();
    this.task.remove();  

    save();  
}

function editText()
{
    this.checkBox.disabled = true;
    this.editButton.style.display = "none";

    const newTextEle = document.createElement("input");
    newTextEle.type = "text";

    let oldText =  this.textEle.innerHTML = this.textEle.innerHTML.toString().replace("<del>", "")
    .toString().replace("</del>", "");
    

    newTextEle.value = oldText;
    this.textEle.innerHTML = "";

    this.textEle.appendChild(newTextEle);
    
    newTextEle.addEventListener("keydown", (event) =>{
        if(event.key == "Enter")
        {
            this.checkBox.disabled = false;
            this.editButton.style.display = "block";

            event.preventDefault();            
            let newText = newTextEle.value;
            
            newTextEle.remove();

            this.textEle.innerHTML = newText;          
            
            replaceTask(oldText, newText);

            save();
        }
    } );

}

function checkup(task)
{
    if(task == "")
    {
        alert("NOT add empty task");
        return false;
    }

    return true;
}

function removeEleFromTask(text)
{
    let index = questions.findIndex((ele) =>{
        return ele === text;
    });

    questions[index] = null;
}


function replaceTask(oldText, newText)
{
    let index = questions.findIndex((ele) =>{
        return ele === oldText;
    });

    questions[index] = newText;
}


let save = () =>{

    let temp = [];

    for(let i = 0; i < questions.length; i++)
    {
        if(questions[i] != null)    
        {
            temp.push(questions[i]);
        }
    }

    console.log(temp);
    console.log(questions);

    // window.localStorage.setItem("tasks", JSON.stringify(temp));

    xhttp = new XMLHttpRequest();

    xhttp.open("post", "/save");
    xhttp.setRequestHeader("Content-type","application/json");
    xhttp.send(JSON.stringify(temp));


    xhttp.addEventListener("load", ()=>{
        if(xhttp.responseText === "error")
        {
            console.log("error");
        }
    });



};


window.addEventListener("load", () =>{
    // questions = JSON.parse(window.localStorage.getItem("tasks"));

    const xhttp = new XMLHttpRequest();

    xhttp.open("get", "/todo");
    xhttp.send();

    xhttp.addEventListener("load", () =>{

        if(xhttp.status === 200 && xhttp.readyState === 4)
        {
            console.log(xhttp.responseText);
            questions = JSON.parse(xhttp.responseText);

            if(questions == undefined)
            {
                questions =  [];
            }

            console.log(questions);

            for(let i = 0; i < questions.length; i++)
            {
                showTask(questions[i]);
            }

        }
        
    })

});

const logout = document.getElementById("logout");

logout.onclick = () =>{
    xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/logout", true);
    xhttp.send();
    location.replace("http://localhost:3000/");
}
