document.addEventListener("DOMContentLoaded", function () {
  // Cache DOM elements for the shop functionality.
  const foodGrid = document.querySelector(".food-grid");
  const foodCards = document.querySelectorAll(".food-card");
  const orderButton = document.querySelector(".stock-complete");

  // Define active and disabled colors.
  const activeButtonColor = "#002366"; // Webster University inspired dark blue
  const disabledButtonColor = "#CCCCCC"; // Neutral gray for disabled state

  // Function to set a button's color based on whether it's active.
  function updateButtonColor(button) {
    if (button.disabled) {
      button.style.backgroundColor = disabledButtonColor;
      button.style.cursor = "not-allowed";
    } else {
      button.style.backgroundColor = activeButtonColor;
      button.style.cursor = "pointer";
    }
  }

  // On DOM load, ensure all stock buttons are styled as active.
  document.querySelectorAll(".in_stock, .not_in_stock").forEach(button => {
    updateButtonColor(button);
  });

  /**
   * buttonClickAnimation:
   * Adds an "animate" class to the clicked button for a short animation,
   * then removes it once the animation ends.
   */
  function buttonClickAnimation(button) {
    button.classList.add("animate");
    button.addEventListener(
      "animationend",
      function () {
        button.classList.remove("animate");
      },
      { once: true }
    );
  }

  /**
   * Event Delegation for Stock Buttons:
   * Listens for clicks on the "В наличии" and "Нет в наличии" buttons.
   * When "В наличии" is clicked:
   *   - Changes the text in the stock element (".stock") to "Добавлено".
   *   - Disables the in_stock button and updates its color.
   *   - Enables the not_in_stock button and updates its color.
   * When "Нет в наличии" is clicked:
   *   - Changes the text in the stock element (".stock") to "Не добавлено".
   *   - Disables the not_in_stock button and updates its color.
   *   - Enables the in_stock button and updates its color.
   */
  foodGrid.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("in_stock") ||
      e.target.classList.contains("not_in_stock")
    ) {
      const card = e.target.closest(".food-card");
      if (!card) return;

      // Ignore click if the button is disabled.
      if (e.target.disabled) return;

      // Get the stock element within the card.
      const stockEl = card.querySelector(".stock");

      if (e.target.classList.contains("in_stock")) {
        // "В наличии" clicked.
        if (stockEl) stockEl.textContent = "Добавлено";
        e.target.disabled = true;
        updateButtonColor(e.target);

        const notInStockBtn = card.querySelector(".not_in_stock");
        if (notInStockBtn) {
          notInStockBtn.disabled = false;
          updateButtonColor(notInStockBtn);
        }
        card.setAttribute("data-status", "available");
      } else if (e.target.classList.contains("not_in_stock")) {
        // "Нет в наличии" clicked.
        if (stockEl) stockEl.textContent = "Не добавлено";
        e.target.disabled = true;
        updateButtonColor(e.target);

        const inStockBtn = card.querySelector(".in_stock");
        if (inStockBtn) {
          inStockBtn.disabled = false;
          updateButtonColor(inStockBtn);
        }
        card.setAttribute("data-status", "not_available");
      }
      // Apply animation on the clicked button.
      buttonClickAnimation(e.target);
    }
  });

  /**
   * Order Button Click Handler:
   * Gathers each food card's status and compiles an order summary.
   * If Telegram WebApp API is available, the data is sent;
   * otherwise, an alert displays the order summary.
   */
  orderButton.addEventListener("click", function () {
    orderButton.classList.add("animate");
    orderButton.addEventListener(
      "animationend",
      function () {
        orderButton.classList.remove("animate");
      },
      { once: true }
    );

    setTimeout(() => {
      let orderSummary = [];
      foodCards.forEach(card => {
        const title = card.querySelector(".food-title").textContent.trim();
        const status = card.getAttribute("data-status");
        if (status) {
          let statusText = status === "available" ? "Добавлено" : "Не добавлено";
          orderSummary.push(`${title}: ${statusText}`);
        }
      });

      if (orderSummary.length === 0) {
        alert("Пожалуйста, выберите статус для хотя бы одного товара.");
        return;
      }

      const summaryData = {
        items: orderSummary,
        totalItems: orderSummary.length,
      };

      if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify(summaryData));
      } else {
        alert("Ваш заказ подтвержден:\n" + JSON.stringify(summaryData, null, 2));
      }
    }, 250);
  });
});

function fetchProductList() {
    fetch("http://127.0.0.1:8000/products", {
        method: "GET",
        credentials: "include" // Include cookies for authentication
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const productList = document.getElementById("product-list");
            productList.innerHTML = ""; // Clear any previously loaded products

            if (data.products.length > 0) {
                data.products.forEach(product => {
                    const productDiv = document.createElement("div");
                    productDiv.classList.add("product-item");
                    productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Price: $${product.price.toFixed(2)}</p>
                `;
                    productList.appendChild(productDiv);
                });
            } else {
                productList.innerHTML = "<p>No products available.</p>";
            }
        })
        .catch(error => {
            console.error("Failed to fetch products:", error);
            alert("Failed to load product list. Please try again.");
        });
}
