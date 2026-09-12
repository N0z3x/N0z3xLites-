const filesContainer = document.getElementById("files");

const searchInput =
    document.getElementById("search");

const categorySelect =
    document.getElementById("category");

const status =
    document.getElementById("status");


let files = [];


/* защита текста */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


/* размер */

function formatSize(bytes) {

    if (!bytes)
        return "";


    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];


    let size = bytes;

    let i = 0;


    while (
        size >= 1024 &&
        i < units.length - 1
    ) {

        size /= 1024;

        i++;

    }


    return (
        size.toFixed(
            i === 0 ? 0 : 1
        )
        +
        " "
        +
        units[i]
    );
}


/* показать файлы */

function render() {

    const search =
        searchInput
        .value
        .toLowerCase();


    const category =
        categorySelect.value;


    const filtered =
        files.filter(file => {

            const text =
                (
                    file.name
                    +
                    " "
                    +
                    file.description
                    +
                    " "
                    +
                    file.category
                )
                .toLowerCase();


            return (

                (
                    !search
                    ||
                    text.includes(search)
                )

                &&

                (
                    !category
                    ||
                    file.category === category
                )

            );

        });


    if (
        filtered.length === 0
    ) {

        filesContainer.innerHTML =
            "<p>Файлов пока нет.</p>";

        return;
    }


    filesContainer.innerHTML =
        filtered
        .map(file => `

            <div class="file">

                <h2>
                    ${escapeHTML(file.name)}
                </h2>


                <span class="category">

                    ${escapeHTML(
                        file.category || "Другое"
                    )}

                </span>


                <p class="description">

                    ${escapeHTML(
                        file.description || ""
                    )}

                </p>


                <div class="info">

                    ${formatSize(file.size)}

                    ${
                        file.date
                        ? " • " + escapeHTML(file.date)
                        : ""
                    }

                </div>


                <a
                    class="download"
                    href="${escapeHTML(file.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    ⬇ Скачать

                </a>

            </div>

        `)
        .join("");

}


/* категории */

function renderCategories() {

    const categories =
        [
            ...new Set(
                files
                .map(file => file.category)
                .filter(Boolean)
            )
        ];


    categorySelect.innerHTML =
        `
        <option value="">
            Все категории
        </option>
        `;


    categories.forEach(category => {

        const option =
            document.createElement("option");


        option.value =
            category;


        option.textContent =
            category;


        categorySelect.appendChild(
            option
        );

    });

}


/* загрузка files.json */

async function loadFiles() {

    try {

        const response =
            await fetch(
                "files.json?t="
                +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP "
                +
                response.status
            );

        }


        files =
            await response.json();


        renderCategories();

        render();


        status.textContent =
            "Файлов: "
            +
            files.length;


    }

    catch(error) {

        console.error(error);


        status.textContent =
            "Ошибка загрузки списка файлов.";

    }

}


searchInput.addEventListener(
    "input",
    render
);


categorySelect.addEventListener(
    "change",
    render
);


/* первый запуск */

loadFiles();


/*
Проверять обновления
каждые 15 секунд
*/

setInterval(
    loadFiles,
    15000
);
