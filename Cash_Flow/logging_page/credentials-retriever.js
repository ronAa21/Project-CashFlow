// we have 3 credentials for the login page to retrieve
// The main logic here is after the customer goes to the shop, the email they provide will be the one they will use to sign up to the website

let email = document.querySelector(".email");
let password = document.querySelector(".password");

// this is for the error display
let rePassEnter = document.getElementById("re-pass-enter");
let errorText = document.createElement("p");
errorText.classList = "error-text";
errorText.style.color = "red";

let checkExistingError = document.querySelector(".error-text"); // avoid duplicates

// modal display
let modalWrapper = document.querySelector(".modal-wrapper");
let loading = document.getElementById("loading");
let success = document.getElementById("success");
let errorDisp = document.getElementById("error");
let errorMsg = document.getElementById("error-msg");

let successBtn = document.querySelector(".success-btn")

const existingToken = localStorage.getItem("token");
const existingRole = localStorage.getItem("role");

if(existingToken && existingRole) {
  if(modalWrapper && loading) {
        modalWrapper.style.display = "flex";
        modalWrapper.classList.add("active");
        loading.style.display = "flex";
        loading.classList.add("active");
    }

    // Redirect based on role
    if (existingRole === "manager") {
        window.location.replace("/manager");
    } else {
        window.location.replace("/customer");
    }
}

document.querySelector(".submit").addEventListener("click", async function(e) {
  e.preventDefault();

  let signEmail = email.value.trim().toLowerCase()
  let signPass = password.value.trim();
  let rePass = document.querySelector(".re-password");

  errorText.remove();

  if (email.value === "") {
    errorText.textContent = "Email cannot be empty";
    rePassEnter.appendChild(errorText);
    return;
  } else if(password.value === "") {
    errorText.textContent = "Password cannot be empty";
    rePassEnter.appendChild(errorText);
    return;
  } else if(rePass.value === ""){
    errorText.textContent = "Please re-enter password";
    rePassEnter.appendChild(errorText);
    return;
  } else if(password.value !== document.querySelector(".re-password").value) {
    errorText.textContent = "password do not match";
    rePassEnter.appendChild(errorText);
    return;
  }

  openModal(loading);

  try {
    const res = await fetch("/project/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: signEmail, password: signPass })
    });

    const data = await res.json();

    if(!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    closeModal(loading);

    showSuccessPill();

    setTimeout(() => {
      window.location.replace("/");
    }, 2000);
  } catch (error) {
    closeModal(loading);

    setTimeout(() => {
      errorMsg.textContent = error.message;
      openModal(errorDisp);
    }, 2000)
  }
});

function openModal(modalElement) {
  modalWrapper.style.display = "flex";
  void modalWrapper.offsetWidth; // force reflow
  modalWrapper.classList.add("active");

  modalElement.style.display = "flex";
  void modalElement.offsetWidth;
  modalElement.classList.add("active");
};

function closeModal(modalElement) {
  modalWrapper.classList.remove("active");
  modalElement.classList.remove("active");

  setTimeout(() => {
      modalWrapper.style.display = "none";
      modalElement.style.display = "none";
  }, 300);
}

function showSuccessPill() {
 modalWrapper.style.display = "none"; // Hide the dark background
 success.style.display = "flex"; // This triggers the slideDownBounce animation 
}

document.querySelectorAll(".success-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    closeModal(errorDisp);
  })
})