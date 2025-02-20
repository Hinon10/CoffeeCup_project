// index.js

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Select all food cards, total price element, and order button from the DOM.
  const foodCards = document.querySelectorAll(".food-card");
  const totalPriceEl = document.querySelector(".total-price");
  const orderButton = document.querySelector(".order-button");

  /**
   * Helper Function: parsePrice
   * Converts a string like "35 000 som" into a number (35000).
   * @param {string} priceStr - The price string from the DOM.
   * @returns {number} - The numeric value of the price.
   */
  function parsePrice(priceStr) {
    // Remove non-digit characters (including spaces and currency text)
    return parseInt(priceStr.replace(/[^\d]/g, ""), 10);
  }

  /**
   * updateTotalPrice
   * Iterates through each food card and recomputes the total price.
   */
  function updateTotalPrice() {
    let total = 0;

    foodCards.forEach((card) => {
      const priceText = card.querySelector(".food-price").textContent.trim();
      const price = parsePrice(priceText);
      const qty = parseInt(card.querySelector(".quantity").textContent, 10);
      total += price * qty;
    });

    // Display the total price formatted with thousands separator
    totalPriceEl.textContent = total.toLocaleString("en-US") + " som";
  }

  /**
   * Setup event listeners for each food card.
   * Both the increment and decrement buttons update the quantity,
   * and then re-compute the total price.
   */
  foodCards.forEach((card) => {
    const decrementButton = card.querySelector(".decrement");
    const incrementButton = card.querySelector(".increment");
    const quantitySpan = card.querySelector(".quantity");

    // Decrement button event listener
    decrementButton.addEventListener("click", function () {
      let qty = parseInt(quantitySpan.textContent, 10);
      if (qty > 0) {
        qty--;
        quantitySpan.textContent = qty;
        updateTotalPrice();
      }
    });

    // Increment button event listener
    incrementButton.addEventListener("click", function () {
      let qty = parseInt(quantitySpan.textContent, 10);
      qty++;
      quantitySpan.textContent = qty;
      updateTotalPrice();
    });
  });

  orderButton.addEventListener("click", function () {
  // Build an order summary
  let orderSummary = [];
  foodCards.forEach((card) => {
    const title = card.querySelector(".food-title").textContent.trim();
    const quantity = parseInt(card.querySelector(".quantity").textContent, 10);
    if (quantity > 0) {
      orderSummary.push(`${title}: ${quantity}`);
    }
  });

  // If no items have been selected, alert the user.
  if (orderSummary.length === 0) {
    alert("Please choose at least one item to order.");
    return;
  }

  // Construct the summary text
  const summaryData = {
    items: orderSummary,
    total: totalPriceEl.textContent,
  };

  // Send the order data to the Telegram bot
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.sendData(JSON.stringify(summaryData)); // Send the data to the bot
    Telegram.WebApp.close(); // Close the web app after sending the data
  }

  // // Provide confirmation to the user
  // alert("Your order has been sent to the Telegram bot!");
});

document.addEventListener("DOMContentLoaded", function () {
  if (window.Telegram && Telegram.WebApp) {
    alert("This page is opened as a Telegram WebApp.");
  } else {
    alert("This page is NOT opened as a Telegram WebApp.");
  }
});
  // /**
  //  * Order Button event listener:
  //  * Compiles the order summary and prompts the user for confirmation.
  //  * On confirmation, you can send the data to a backend, or use Telegram Web App API.
  //  */
  // orderButton.addEventListener("click", function () {
  //   // Build an order summary
  //   let orderSummary = [];
  //   foodCards.forEach((card) => {
  //     const title = card.querySelector(".food-title").textContent.trim();
  //     const quantity = parseInt(card.querySelector(".quantity").textContent, 10);
  //     if (quantity > 0) {
  //       orderSummary.push(`${title}: ${quantity}`);
  //     }
  //   });
  //
  //   // If no items have been selected, alert the user.
  //   if (orderSummary.length === 0) {
  //     alert("Please choose at least one item to order.");
  //     return;
  //   }
  //
  //   // Construct the summary text
  //   const summaryText =
  //     orderSummary.join("\n") +
  //     "\n\nTotal: " +
  //     totalPriceEl.textContent +
  //     "\n\nDo you want to place the order?";
  //
  //   if (confirm(summaryText)) {
  //     // Here you can integrate with a backend API or Telegram Web App.
  //     // For example, if using Telegram Web App API:
  //     if (window.Telegram && Telegram.WebApp) {
  //       // Optionally expand the web app or send data via the Telegram API.
  //       Telegram.WebApp.sendData(
  //         JSON.stringify({ order: orderSummary, total: totalPriceEl.textContent })
  //       );
  //     }
  //     // Clear or reset order form, then give feedback
  //     alert("Order placed successfully!");
  //   }
  // });

  /**
   * (Optional) You could persist order information in localStorage.
   * Uncomment the following code to load saved quantities on page load.
   */
  /*
  function loadOrderFromStorage() {
    foodCards.forEach((card, index) => {
      const savedQty = localStorage.getItem("food_qty_" + index);
      if (savedQty !== null) {
        card.querySelector(".quantity").textContent = savedQty;
      }
    });
    updateTotalPrice();
  }

  function saveOrderToStorage() {
    foodCards.forEach((card, index) => {
      const qty = card.querySelector(".quantity").textContent;
      localStorage.setItem("food_qty_" + index, qty);
    });
  }

  // Load order on page load
  loadOrderFromStorage();

  // Save order on page unload
  window.addEventListener("beforeunload", saveOrderToStorage);
  */

  // Initialize the total price calculation on DOM load.
  updateTotalPrice();
});