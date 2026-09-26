const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const productGrid = document.getElementById("productGrid");

const filterArea = document.getElementById("filterArea");
const storeFilter = document.getElementById("storeFilter");

const searchSuggestions =
    document.getElementById("searchSuggestions");

let currentResults = [];
let currentSearchName = "";
let currentStore = "all";
let currentSort = "low";


const popularStores = [
    "Amazon",
    "Flipkart",
    "Croma",
    "Reliance Digital",
    "Myntra",
    "Tata CLiQ"
];


const productSuggestions = [
    "iPhone 15",
    "iPhone 16",
    "Samsung Galaxy S24",
    "Samsung Galaxy S25",
    "OnePlus 13",
    "OnePlus Nord",
    "Google Pixel 9",
    "MacBook Air M3",
    "MacBook Air M4",
    "Dell Laptop",
    "HP Laptop",
    "Lenovo Laptop",
    "Sony Headphones",
    "Boat Headphones",
    "AirPods",
    "iPad",
    "Samsung TV",
    "Sony TV",
    "LG TV",
    "PlayStation 5"
];


// SEARCH SUGGESTIONS

searchInput.addEventListener("input", function () {

    const text =
        searchInput.value.trim().toLowerCase();

    if (!text) {

        searchSuggestions.style.display = "none";
        searchSuggestions.innerHTML = "";

        return;
    }


    const matches =
        productSuggestions.filter(product =>
            product.toLowerCase().includes(text)
        );


    if (!matches.length) {

        searchSuggestions.style.display = "none";
        searchSuggestions.innerHTML = "";

        return;
    }


    searchSuggestions.innerHTML = "";


    matches.slice(0, 6).forEach(product => {

        const suggestion =
            document.createElement("div");


        suggestion.className =
            "suggestion-item";


        suggestion.textContent =
            product;


        suggestion.addEventListener(
            "click",
            function () {

                searchInput.value =
                    product;

                searchSuggestions.style.display =
                    "none";

                searchForm.requestSubmit();

            }
        );


        searchSuggestions.appendChild(
            suggestion
        );

    });


    searchSuggestions.style.display =
        "block";

});


document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".search-container"
            )
        ) {

            searchSuggestions.style.display =
                "none";

        }

    }
);


// SEARCH

searchForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const productName =
            searchInput.value.trim();


        if (!productName) {

            alert(
                "Please product ka naam enter karo."
            );

            return;
        }


        searchSuggestions.style.display =
            "none";


        showLoading(productName);


        filterArea.style.display =
            "none";


        try {

            const response =
                await fetch(
                    `/api/search?q=${encodeURIComponent(productName)}`
                );


            if (!response.ok) {
                throw new Error(
                    "Server response error"
                );
            }


            const data =
                await response.json();


            if (!data.success) {

                showError(
                    data.message ||
                    "Product search failed."
                );

                return;
            }


            currentResults =
                Array.isArray(data.results)
                    ? data.results.filter(item =>
                        item.price !== null &&
                        item.price !== undefined &&
                        !isNaN(Number(item.price))
                    )
                    : [];


            currentSearchName =
                data.search || productName;


            currentStore =
                "all";


            currentSort =
                "low";


            if (!currentResults.length) {

                showNoResults();

                return;
            }


            setupStoreFilter();


            showSearchResults();

        }

        catch (error) {

            console.error(error);


            showError(
                "Server se data nahi aa raha. " +
                "Please check karo ki Node.js server running hai."
            );

        }

    }
);


// LOADING

function showLoading(productName) {

    productGrid.innerHTML = `

        <div class="loading">

            <h3>
                Searching...
            </h3>

            <p>
                ${escapeHTML(productName)}
                ke real prices check ho rahe hain...
            </p>

        </div>

    `;
}


// ERROR

function showError(message) {

    productGrid.innerHTML = `

        <div class="loading">

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;
}


// NO RESULTS

function showNoResults() {

    productGrid.innerHTML = `

        <div class="loading">

            <h3>
                Koi price result nahi mila.
            </h3>

            <p>
                Product ka naam change karke
                dobara search karo.
            </p>

        </div>

    `;
}


// STORE FILTER

function setupStoreFilter() {

    storeFilter.innerHTML = "";


    addStoreOption(
        "all",
        `All Stores (${currentResults.length})`
    );


    popularStores.forEach(store => {

        const count =
            currentResults.filter(item =>
                matchesStore(
                    item.store,
                    store
                )
            ).length;


        addStoreOption(
            store,
            `${store} (${count} results)`
        );

    });


    const otherStores = [
        ...new Set(
            currentResults
                .map(item => item.store)
                .filter(store =>
                    !popularStores.some(
                        popularStore =>
                            matchesStore(
                                store,
                                popularStore
                            )
                    )
                )
        )
    ];


    otherStores.sort();


    otherStores.forEach(store => {

        const count =
            currentResults.filter(
                item =>
                    item.store === store
            ).length;


        addStoreOption(
            store,
            `${store} (${count} results)`
        );

    });


    storeFilter.value =
        "all";


    filterArea.style.display =
        "block";
}


function addStoreOption(
    value,
    text
) {

    const option =
        document.createElement("option");


    option.value =
        value;


    option.textContent =
        text;


    storeFilter.appendChild(
        option
    );
}


// STORE MATCHING

function matchesStore(
    itemStore,
    selectedStore
) {

    const store =
        String(itemStore)
            .toLowerCase();


    const selected =
        String(selectedStore)
            .toLowerCase();


    if (selected === "amazon") {
        return store.includes("amazon");
    }


    if (selected === "flipkart") {
        return store.includes("flipkart");
    }


    if (selected === "croma") {
        return store.includes("croma");
    }


    if (selected === "reliance digital") {

        return (
            store.includes("reliance digital") ||
            store.includes("reliancedigital")
        );

    }


    if (selected === "myntra") {
        return store.includes("myntra");
    }


    if (selected === "tata cliq") {

        return (
            store.includes("tata cliq") ||
            store.includes("tatacliq")
        );

    }


    return store === selected;

}


// STORE FILTER CHANGE

storeFilter.addEventListener(
    "change",
    function () {

        currentStore =
            storeFilter.value;


        showSearchResults();

    }
);


// SORT CHANGE

function sortResults(results) {

    return [...results].sort(
        (a, b) => {

            const priceA =
                Number(a.price);

            const priceB =
                Number(b.price);


            if (currentSort === "high") {
                return priceB - priceA;
            }


            return priceA - priceB;

        }
    );

}


// SHOW RESULTS

function showSearchResults() {

    productGrid.innerHTML = "";


    let results =
        currentStore === "all"

            ? currentResults

            : currentResults.filter(item =>
                matchesStore(
                    item.store,
                    currentStore
                )
            );


    if (!results.length) {

        productGrid.innerHTML = `

            <div class="loading">

                <h3>
                    Is store ke liye result available nahi hai.
                </h3>

                <p>
                    Is product ka shopping result
                    API se nahi mila.
                </p>

            </div>

        `;

        return;
    }


    const sortedResults =
        sortResults(results);


    const lowestResult =
        [...results].sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        )[0];


    const lowestPrice =
        Number(
            lowestResult.price
        );


    // RESULT HEADER

    const resultHeader =
        document.createElement("div");


    resultHeader.className =
        "result-header";


    resultHeader.style.gridColumn =
        "1 / -1";


    resultHeader.innerHTML = `

        <h2>
            ${escapeHTML(currentSearchName)}
            - Price Comparison
        </h2>

        <p>
            ${sortedResults.length}
            shopping results found
        </p>

    `;


    productGrid.appendChild(
        resultHeader
    );


    // SORT BAR

    const sortBar =
        document.createElement("div");


    sortBar.style.gridColumn =
        "1 / -1";


    sortBar.style.textAlign =
        "right";


    sortBar.style.marginBottom =
        "5px";


    sortBar.innerHTML = `

        <label
            for="sortSelect"
            style="font-weight:bold; margin-right:8px;"
        >
            Sort:
        </label>

        <select
            id="sortSelect"
            style="
                padding:10px 14px;
                border:1px solid #ccc;
                border-radius:7px;
                background:white;
                cursor:pointer;
            "
        >

            <option value="low">
                Price: Low to High
            </option>

            <option value="high">
                Price: High to Low
            </option>

        </select>

    `;


    productGrid.appendChild(
        sortBar
    );


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    sortSelect.value =
        currentSort;


    sortSelect.addEventListener(
        "change",
        function () {

            currentSort =
                sortSelect.value;

            showSearchResults();

        }
    );


    // LOWEST PRICE CARD

    const lowestCard =
        document.createElement("div");


    lowestCard.className =
        "lowest-price-card";


    lowestCard.style.gridColumn =
        "1 / -1";


    lowestCard.innerHTML = `

        <div>

            <span class="lowest-label">
                LOWEST AVAILABLE PRICE
            </span>

            <h3>
                ₹${lowestPrice.toLocaleString("en-IN")}
            </h3>

            <p>
                ${escapeHTML(
                    lowestResult.store
                )}
            </p>

        </div>


        <a
            href="${safeURL(
                lowestResult.link
            )}"
            target="_blank"
            rel="noopener noreferrer"
            class="lowest-button"
        >
            View Lowest Deal
        </a>

    `;


    productGrid.appendChild(
        lowestCard
    );


    // PRODUCT CARDS

    sortedResults.forEach(item => {

        const price =
            Number(item.price);


        const isLowest =
            price === lowestPrice;


        const productPage =
            `product.html?product=${encodeURIComponent(item.product)}` +
            `&store=${encodeURIComponent(item.store)}` +
            `&price=${encodeURIComponent(price)}` +
            `&image=${encodeURIComponent(item.image || "")}` +
            `&link=${encodeURIComponent(item.link || "#")}`;


        const card =
            document.createElement("div");


        card.className =
            "product-card";


        const imageHTML =
            item.image

                ? `
                    <img
                        src="${safeURL(item.image)}"
                        alt="${escapeHTML(item.product)}"
                        class="product-image"
                        onerror="this.style.display='none'"
                    >
                `

                : "";


        card.innerHTML = `

            ${imageHTML}

            <div class="product-info">

                <h3>
                    ${escapeHTML(item.product)}
                </h3>

                <p class="store-name">
                    ${escapeHTML(item.store)}
                </p>

                <p class="product-price">
                    ₹${price.toLocaleString("en-IN")}
                </p>

                ${
                    isLowest
                        ? `
                            <span class="best-price">
                                LOWEST PRICE
                            </span>
                        `
                        : ""
                }

                <br><br>

                <a
                    href="${productPage}"
                    class="store-button"
                >
                    View Deal
                </a>

            </div>

        `;


        productGrid.appendChild(
            card
        );

    });

}


// SECURITY HELPERS

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function safeURL(value) {

    const url =
        String(value || "").trim();


    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {

        return url;

    }


    return "#";

}