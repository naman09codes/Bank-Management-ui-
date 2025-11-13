// DOM Elements
const loginPage = document.getElementById('loginPage');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');

// Account data structure
let accounts = {
    savings: {
        balance: 1500000,
        accountNumber: 'SAV1234',
        type: 'Savings Account'
    },
    checking: {
        balance: 1000000,
        accountNumber: 'CHK5678',
        type: 'Checking Account'
    }
};

// Sample data (In a real application, this would come from a backend)
let currentUser = null;
let transactions = [
    {
        id: 1,
        date: '2024-03-15',
        description: 'Salary Deposit',
        account: 'Savings',
        amount: 50000,
        status: 'Completed'
    },
    {
        id: 2,
        date: '2024-03-14',
        description: 'Utility Bill Payment',
        account: 'Checking',
        amount: -2500,
        status: 'Completed'
    }
];

// Login functionality
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // In a real application, this would be an API call
    if (username && password) {
        currentUser = {
            username,
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 9876543210'
        };
        showMainContent();
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    showLoginPage();
});

// Navigation functionality
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// CRUD Operations for Transactions
function createTransaction(transaction) {
    transaction.id = transactions.length + 1;
    transactions.push(transaction);
    updateTransactionList();
}

function readTransactions() {
    return transactions;
}

function updateTransaction(id, updatedData) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedData };
        updateTransactionList();
    }
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateTransactionList();
}

// Update account balances in UI
function updateAccountBalances() {
    // Update dashboard cards
    document.querySelector('.balance .amount').textContent = 
        `₹${(accounts.savings.balance + accounts.checking.balance).toLocaleString()}`;
    document.querySelector('.savings .amount').textContent = 
        `₹${accounts.savings.balance.toLocaleString()}`;
    document.querySelector('.checking .amount').textContent = 
        `₹${accounts.checking.balance.toLocaleString()}`;

    // Update accounts section
    document.querySelectorAll('.account-card').forEach(card => {
        const accountType = card.querySelector('.account-header h3').textContent.toLowerCase().includes('savings') ? 'savings' : 'checking';
        card.querySelector('.balance').textContent = 
            `₹${accounts[accountType].balance.toLocaleString()}`;
    });
}

// Transfer money functionality
document.getElementById('transfer-btn')?.addEventListener('click', () => {
    const fromAccount = document.getElementById('from-account').value;
    const toAccount = document.getElementById('to-account').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!fromAccount || !toAccount || !amount) {
        alert('Please fill in all fields');
        return;
    }

    if (amount <= 0) {
        alert('Amount must be greater than 0');
        return;
    }

    if (fromAccount === toAccount) {
        alert('Cannot transfer to the same account');
        return;
    }

    // Check if sufficient balance
    if (accounts[fromAccount].balance < amount) {
        alert('Insufficient balance');
        return;
    }

    // Update account balances
    accounts[fromAccount].balance -= amount;
    accounts[toAccount].balance += amount;

    // Create transaction records
    const transaction = {
        date: new Date().toISOString().split('T')[0],
        description: `Transfer to ${accounts[toAccount].type}`,
        account: accounts[fromAccount].type,
        amount: -amount,
        status: 'Completed'
    };
    createTransaction(transaction);
    
    // Create corresponding transaction for receiving account
    const receivingTransaction = {
        ...transaction,
        description: `Transfer from ${accounts[fromAccount].type}`,
        account: accounts[toAccount].type,
        amount: amount
    };
    createTransaction(receivingTransaction);

    // Update UI
    updateAccountBalances();
    updateTransactionList();
    
    // Clear form
    document.getElementById('amount').value = '';
    
    // Show success message
    alert('Transfer completed successfully!');
});

// Update transaction list in the UI
function updateTransactionList() {
    const transactionList = document.getElementById('transaction-list');
    if (!transactionList) return;

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    transactionList.innerHTML = sortedTransactions.map(transaction => `
        <tr>
            <td>${transaction.date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.account}</td>
            <td class="${transaction.amount > 0 ? 'positive' : 'negative'}">
                ₹${Math.abs(transaction.amount).toLocaleString()}
            </td>
            <td>${transaction.status}</td>
            <td>
                <button onclick="viewTransactionDetails(${transaction.id})" class="btn-secondary">View</button>
            </td>
        </tr>
    `).join('');

    // Update recent transactions in dashboard
    const recentTransactionsList = document.querySelector('.recent-transactions .transaction-list');
    if (recentTransactionsList) {
        recentTransactionsList.innerHTML = sortedTransactions.slice(0, 5).map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="description">${transaction.description}</span>
                    <span class="date">${transaction.date}</span>
                </div>
                <span class="amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : '-'}₹${Math.abs(transaction.amount).toLocaleString()}
                </span>
            </div>
        `).join('');
    }
}

// View transaction details
function viewTransactionDetails(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        alert(`
            Transaction Details:
            Date: ${transaction.date}
            Description: ${transaction.description}
            Account: ${transaction.account}
            Amount: ₹${Math.abs(transaction.amount).toLocaleString()}
            Status: ${transaction.status}
        `);
    }
}

// Profile update functionality
function updateProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (currentUser) {
        currentUser = {
            ...currentUser,
            fullName,
            email,
            phone
        };
        document.getElementById('userName').textContent = fullName;
        alert('Profile updated successfully!');
    }
}

// View account details
function viewAccountDetails(accountType) {
    alert(`Viewing details for ${accountType} account`);
    // In a real application, this would show a modal with detailed account information
}

// Transfer money from specific account
function transferMoney(accountType) {
    document.getElementById('from-account').value = accountType;
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === 'transfer') {
            link.click();
        }
    });
}

// Edit transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        // In a real application, this would show a modal with a form to edit the transaction
        const newAmount = prompt('Enter new amount:', Math.abs(transaction.amount));
        if (newAmount !== null) {
            updateTransaction(id, { amount: parseFloat(newAmount) });
        }
    }
}

// Helper functions
function showMainContent() {
    loginPage.style.display = 'none';
    mainContent.style.display = 'block';
    updateTransactionList();
}

function showLoginPage() {
    loginPage.style.display = 'flex';
    mainContent.style.display = 'none';
    loginForm.reset();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    showLoginPage();
    updateAccountBalances();
}); 