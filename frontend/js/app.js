// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

"use strict";

const API_URL = "http://localhost:3000/api/expenses";



const expenseTableBody = document.getElementById("expenseTableBody");
const loadingSpinner = document.getElementById("loadingSpinner");
const alertMessage = document.getElementById("alertMessage");

const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const highestExpense = document.getElementById("highestExpense");

const categoryFilter = document.getElementById("categoryFilter");

const expenseForm = document.getElementById("expenseForm");
const saveEditBtn = document.getElementById("saveEditBtn");


let expenses = [];




async function getExpenses() {

    try {

        showLoading();

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        expenses = await response.json();

        renderExpenses(expenses);

        updateSummary(expenses);

    } catch (error) {

        showAlert(
            "Unable to connect to the server.",
            "danger"
        );

    } finally {

        hideLoading();
    }
}



function renderExpenses(expensesToRender) {

    expenseTableBody.innerHTML = "";

    expensesToRender.forEach(expense => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${expense.title}</td>

            <td>${expense.amount}</td>

            <td>
                <span class="badge bg-primary">
                    ${expense.category}
                </span>
            </td>

            <td>${expense.date}</td>

            <td>

                <button
                    class="btn btn-sm btn-warning me-1 edit-btn"
                    data-id="${expense.id}">
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-danger delete-btn"
                    data-id="${expense.id}">
                    Delete
                </button>

            </td>
        `;

        expenseTableBody.appendChild(row);
    });

    addEditEvents();
    addDeleteEvents();
}



expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title =
        document.getElementById("title").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const category =
        document.getElementById("category").value;

    const date =
        document.getElementById("date").value;




    if (title === "") {

        showAlert(
            "Title is required.",
            "danger"
        );

        return;
    }

    if (amount <= 0 || isNaN(amount)) {

        showAlert(
            "Amount must be greater than 0.",
            "danger"
        );

        return;
    }

    if (category === "") {

        showAlert(
            "Please select a category.",
            "danger"
        );

        return;
    }

    if (date === "") {

        showAlert(
            "Date is required.",
            "danger"
        );

        return;
    }


    try {

        showLoading();

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                amount: amount,
                category: category,
                date: date
            })
        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(data.message);
        }


        showAlert(
            "Expense added successfully.",
            "success"
        );


        expenseForm.reset();


      

        await getExpenses();


    } catch (error) {

        showAlert(
            error.message || "Failed to add expense.",
            "danger"
        );

    } finally {

        hideLoading();
    }
});



function formatDateForInput(date) {

    const [day, month, year] = date.split("-");

    return `${year}-${month}-${day}`;
}

function addEditEvents() {

    const editButtons =
        document.querySelectorAll(".edit-btn");


    editButtons.forEach(button => {

        button.addEventListener("click", function () {

            const id =
                Number(button.dataset.id);


            const expense =
                expenses.find(
                    expense => expense.id === id
                );


            if (!expense) {
                return;
            }


            // Put expense data inside modal

            document.getElementById("editId").value =
                expense.id;

            document.getElementById("editTitle").value =
                expense.title;

            document.getElementById("editAmount").value =
                expense.amount;

            document.getElementById("editCategory").value =
                expense.category;

          

            document.getElementById("editDate").value =
    formatDateForInput(expense.date);


      
            const modalElement =
                document.getElementById("editExpenseModal");

            const modal =
                new bootstrap.Modal(modalElement);

            modal.show();

        });
    });
}




saveEditBtn.addEventListener("click", async function () {

    const id =
        Number(
            document.getElementById("editId").value
        );


    const title =
        document.getElementById("editTitle").value.trim();


    const amount =
        Number(
            document.getElementById("editAmount").value
        );


    const category =
        document.getElementById("editCategory").value;


    const date =
        document.getElementById("editDate").value;


  

    if (title === "") {

        showAlert(
            "Title is required.",
            "danger"
        );

        return;
    }


    if (amount <= 0 || isNaN(amount)) {

        showAlert(
            "Amount must be greater than 0.",
            "danger"
        );

        return;
    }


    if (category === "") {

        showAlert(
            "Please select a category.",
            "danger"
        );

        return;
    }


    if (date === "") {

        showAlert(
            "Date is required.",
            "danger"
        );

        return;
    }


    try {

        showLoading();


        const response =
            await fetch(`${API_URL}/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    amount: amount,
                    category: category,
                    date: date
                })
            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(data.message);
        }


        showAlert(
            "Expense updated successfully.",
            "success"
        );


      

        const modalElement =
            document.getElementById("editExpenseModal");


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        modal.hide();


     

        await getExpenses();


    } catch (error) {

        showAlert(
            error.message || "Failed to update expense.",
            "danger"
        );

    } finally {

        hideLoading();
    }
});



function addDeleteEvents() {

    const deleteButtons =
        document.querySelectorAll(".delete-btn");


    deleteButtons.forEach(button => {

        button.addEventListener("click", async function () {

            const id =
                Number(button.dataset.id);


            const confirmed =
                confirm(
                    "Are you sure you want to delete this expense?"
                );


            if (!confirmed) {
                return;
            }


            try {

                showLoading();


                const response =
                    await fetch(`${API_URL}/${id}`, {

                        method: "DELETE"
                    });


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(data.message);
                }


                showAlert(
                    "Expense deleted successfully.",
                    "success"
                );


           

                await getExpenses();


            } catch (error) {

                showAlert(
                    error.message ||
                    "Failed to delete expense.",
                    "danger"
                );

            } finally {

                hideLoading();
            }

        });
    });
}



function updateSummary(expenses) {

    const total =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );


    const count =
        expenses.length;


    const highest =
        expenses.length > 0
            ? Math.max(
                ...expenses.map(
                    expense =>
                        Number(expense.amount)
                )
            )
            : 0;


    totalAmount.textContent =
        total.toFixed(2);


    expenseCount.textContent =
        count;


    highestExpense.textContent =
        highest.toFixed(2);
}



categoryFilter.addEventListener(
    "change",
    function () {

        const selectedCategory =
            categoryFilter.value;


        if (selectedCategory === "all") {

            renderExpenses(expenses);

            return;
        }


        const filteredExpenses =
            expenses.filter(
                expense =>
                    expense.category ===
                    selectedCategory
            );


        renderExpenses(filteredExpenses);
    }
);



function showLoading() {

    loadingSpinner.classList.remove(
        "d-none"
    );
}


function hideLoading() {

    loadingSpinner.classList.add(
        "d-none"
    );
}



function showAlert(message, type) {

    alertMessage.textContent =
        message;


    alertMessage.className =
        `alert alert-${type}`;


    setTimeout(() => {

        alertMessage.classList.add(
            "d-none"
        );

    }, 3000);
}




getExpenses();