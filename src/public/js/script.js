//Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    const sidebar = document.getElementById("sidebar");

    mobileMenuToggle.addEventListener("click", () => {
        mobileMenuOverlay.classList.remove("hidden");
        mobileMenuOverlay.classList.add("block");
        sidebar.classList.add("translate-x-0");
        sidebar.classList.remove("translate-x-full");
        sidebar.classList.remove("ease-in");
        sidebar.classList.add("ease-out");
        mobileMenuToggle.innerHTML = `
            <i class="fa-solid fa-times"></i>
        `;
    });

    mobileMenuOverlay.addEventListener("click", () => {
        mobileMenuOverlay.classList.remove("block");
        mobileMenuOverlay.classList.add("hidden");
        sidebar.classList.remove("translate-x-0");
        sidebar.classList.add("translate-x-full");
        sidebar.classList.remove("ease-in");
        sidebar.classList.add("ease-out");
        mobileMenuToggle.innerHTML = `
            <i class="fa-solid fa-bars"></i>
        `;
    });
});

const activeTimeouts = {};
function showAlert(type, message) {
    let alert, alert_message;

    if (type === "success") {
        alert = document.getElementById("success-alert");
        alert_message = document.getElementById("success-message");
    } else if (type === "error") {
        alert = document.getElementById("error-alert");
        alert_message = document.getElementById("error-message");
    }
    alert_message.innerHTML = message;
    alert.classList.remove("hidden");

    if (activeTimeouts[type]) {
        clearTimeout(activeTimeouts[type]);
    }

    activeTimeouts[type] = setTimeout(() => {
        if (!alert.classList.contains("hidden")) {
            alert.classList.add("hidden");
        }
    }, 2500);

    const closeBtn = alert.querySelector("button");
    closeBtn.addEventListener("click", () => {
        if (activeTimeouts[type]) {
            clearTimeout(activeTimeouts[type]);
            delete activeTimeouts[type];
        }
        alert.classList.add("hidden");
    });
}

function showModal(title, description, confirmName, confirmCallback) {
    const modal = document.getElementById("cmodal");
    const modalTitle = document.getElementById("ctitle-text");
    const modalDescription = document.getElementById("cdescription-text");
    const closeButton = document.getElementById("cclose-icon");
    const cancelButton = document.getElementById("ccancel-button");
    const confirmButton = document.getElementById("cconfirm-button");

    confirmButton.innerText = confirmName;
    modal.classList.remove("hidden");
    modalTitle.innerText = title;
    modalDescription.innerHTML = description;
    closeButton.addEventListener("click", () => {
        hide();
    });
    cancelButton.addEventListener("click", () => {
        hide();
    });
    confirmButton.addEventListener("click", () => {
        confirmCallback();
        hide();
    });

    const hide = () => {
        modal.classList.add("hidden");
    };
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showLoading() {
    const preloader = document.getElementById("preloader");
    preloader.classList.remove("hidden");
}

function hideLoading() {
    const preloader = document.getElementById("preloader");
    preloader.classList.add("hidden");
}

Symbol.result = Symbol("result");

Function.prototype[Symbol.result] = function (...args) {
    try {
        const result = this.apply(this, args);

        if (result && typeof result === "object" && Symbol.result in result) {
            return result[Symbol.result]();
        }

        return [null, result];
    } catch (error) {
        return [error || new Error("Thrown error is falsy")];
    }
};

Promise.prototype[Symbol.result] = async function () {
    try {
        const result = await this;
        return [null, result];
    } catch (error) {
        return [error || new Error("Thrown error is falsy")];
    }
};

function copyText(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            showAlert("success", "Copied to clipboard");
        })
        .catch(() => {
            showAlert("error", "Failed to copy to clipboard");
        });
}
