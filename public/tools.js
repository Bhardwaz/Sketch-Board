let optionsCont = document.querySelector(".options-cont");
let toolsCont = document.querySelector(".tools-cont");
let pencilToolCont = document.querySelector(".pencil-tool-cont");
let eraserToolCont = document.querySelector(".eraser-tool-cont");
let pencil = document.querySelector("#pencil");
let eraser = document.querySelector("#eraser");
let sticky = document.querySelector("#stickyNote");
let upload = document.querySelector("#upload");
let optionsFlag = true;
let pencilFlag = false;
let eraserFlag = false;
optionsCont.addEventListener("click", (e) => {
  optionsFlag = !optionsFlag;
  if (optionsFlag) openTools();
  else closeTools();
});
function openTools() {
  let iconElem = optionsCont.children[0];
  iconElem.classList.remove("fa-times");
  iconElem.classList.add("fa-bars");
  toolsCont.style.display = "flex";
}
function closeTools() {
  let iconElem = optionsCont.children[0];
  iconElem.classList.remove("fa-bars");
  iconElem.classList.add("fa-times");
  toolsCont.style.display = "none";
  pencilToolCont.style.display = "none";
  eraserToolCont.style.display = "none";
}
pencil.addEventListener("click", (e) => {
  pencilFlag = !pencilFlag;
  if (pencilFlag) {
    pencilToolCont.style.display = "block";
    eraser.style.opacity = "1";
    tool.strokeStyle = pencilColor;
  } else {
    pencilToolCont.style.display = "none";
    eraser.style.opacity = "1";
    tool.strokeStyle = pencilColor;
  }
});
eraser.addEventListener("click", (e) => {
  eraserFlag = !eraserFlag;
  if (eraserFlag) {
    eraserToolCont.style.display = "flex";
    eraser.style.opacity = "0.5";
  } else {
    eraserToolCont.style.display = "none";
    eraser.style.opacity = "1";
  }
});

upload.addEventListener("click", (e) => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.click();

  input.addEventListener("change", (e) => {
    let file = input.files[0];
    let url = URL.createObjectURL(file);

    let stickyTemplateHtml = ` <div class="header-cont">
    <div class="minimize"></div>
        <div class="remove"></div>
     </div>
<div class="note-cont">
    <img src="${url}"
</div>
`;
    createSticky(stickyTemplateHtml);
  });
});

sticky.addEventListener("click", (e) => {
  let stickyTemplateHtml = `
   <div class="header-cont">
           <div class="minimize"></div>
           <div class="remove"></div>
       </div>
       <div class="note-cont">
           <textarea name="" spellCheck="false" cols="30" rows="10"></textarea>
       </div>
   `;
  socket.emit("sticky", stickyTemplateHtml);
});

function createSticky(stickyTemplateHtml) {
  const stickyCont = document.createElement("div");
  stickyCont.setAttribute("class", "sticky-cont");
  stickyCont.innerHTML = stickyTemplateHtml;
  document.body.appendChild(stickyCont);
  let minimize = document.querySelector(".minimize");
  let remove = document.querySelector(".remove");
  noteActions(minimize, remove, stickyCont);
  stickyCont.onmousedown = function (event) {
    dragAndDrop(stickyCont, event);
  };
  stickyCont.ondragstart = function () {
    return false;
  };
}

function noteActions(minimize, remove, stickyCont) {
  remove.addEventListener("click", (e) => {
    // const response = window.confirm("Do You want to delete sticky note?");
    // if (response)
    stickyCont.remove();
  });
  minimize.addEventListener("click", (e) => {
    let noteCont = stickyCont.querySelector(".note-cont");
    let display = getComputedStyle(noteCont).getPropertyValue("display");
    if (display === "none") noteCont.style.display = "block";
    else noteCont.style.display = "none";
  });
}

function dragAndDrop(element, event) {
  let shiftX = event.clientX - element.getBoundingClientRect().left;
  let shiftY = event.clientY - element.getBoundingClientRect().top;

  element.style.position = "absolute";
  element.style.zIndex = 1000;

  moveAt(event.pageX, event.pageY);

  // moves the ball at (pageX, pageY) coordinates
  // taking initial shifts into account
  function moveAt(pageX, pageY) {
    element.style.left = pageX - shiftX + "px";
    element.style.top = pageY - shiftY + "px";
  }

  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }

  // move the ball on mousemove
  document.addEventListener("mousemove", onMouseMove);

  // drop the ball, remove unneeded handlers
  element.onmouseup = function () {
    document.removeEventListener("mousemove", onMouseMove);
    element.onmouseup = null;
  };
}
socket.on("sticky", (data) => {
  createSticky(data);
});
