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
let loading = document.getElementById("loading");
let success = document.getElementById("success");

let successBtn = document.querySelector(".success-btn")

// initially this bit right here should check an email on the database(this is for the backend) to check if it is existing

let customerOrders = JSON.parse(localStorage.getItem("customerOrders")) || []

console.log(customerOrders)

let users = JSON.parse(localStorage.getItem("users")) || [];

document.querySelector(".submit").addEventListener("click", function() {

  let signEmail = email.value.trim().toLowerCase()
  let signPass = password.value.trim();

  if (email.value === "") {
    errorText.textContent = "Email cannot be empty";
    rePassEnter.appendChild(errorText);
    return;
  } else if(password.value === "") {
    errorText.textContent = "Password cannot be empty";
    rePassEnter.appendChild(errorText);
    return;
  } else if(document.querySelector(".re-password").value === ""){
    errorText.textContent = "Please re-enter password";
    rePassEnter.appendChild(errorText);
    return;
  } else if(password.value !== document.querySelector(".re-password").value) {
    errorText.textContent = "password do not match";
    rePassEnter.appendChild(errorText);
    return;
  }

  let found = customerOrders.some(co => co.email.toLowerCase() === signEmail);

    if(found){
      let existed = users.some(u => u.email === signEmail);
      if(!existed) {
        users.push({email: signEmail, password: signPass});
        localStorage.setItem("users", JSON.stringify(users));
      }
      verification(successDisplay);
    } else {
    errorText.textContent = "Non existent credentials";
    rePassEnter.appendChild(errorText);
  }
})

console.log(users)


// this is just a mock loading;
function verification(success) {
  loading.style.display = "flex";
  setTimeout(() => {
    success();
  }, 5000)
}

function successDisplay() {
  loading.style.display = "none";
  success.style.display = "flex";
  document.querySelector(".success-btn").addEventListener("click", () => {
    success.style.display = "none";
    window.location.href = "loginPage.html";
  })
}