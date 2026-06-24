(function () {
    var page = window.LIST_PAGE;
    var heading = document.getElementById("list-heading");
    var lede = document.getElementById("list-lede");
    var headerMeta = document.getElementById("list-header-meta");
    var pageNote = document.getElementById("list-page-note");
    var mount = document.getElementById("list-items");

    if (!page || !heading || !mount) {
        return;
    }

    function setCopy(node, text, html) {
        if (!node) {
            return;
        }

        if (html) {
            node.innerHTML = html;
            node.hidden = false;
            return;
        }

        if (text) {
            node.textContent = text;
            node.hidden = false;
            return;
        }

        node.hidden = true;
    }

    function appendParagraphs(node, text, className) {
        var paragraphs;

        if (!node) {
            return;
        }

        node.textContent = "";

        paragraphs = String(text)
            .split(/\n\s*\n/)
            .map(function (paragraph) {
                return paragraph.trim();
            })
            .filter(Boolean);

        if (!paragraphs.length) {
            node.hidden = true;
            return;
        }

        paragraphs.forEach(function (paragraph) {
            var child = document.createElement("p");
            var lines = paragraph.split("\n");

            child.className = className;

            lines.forEach(function (line, index) {
                if (index > 0) {
                    child.appendChild(document.createElement("br"));
                }

                child.appendChild(document.createTextNode(line));
            });

            node.appendChild(child);
        });

        node.hidden = false;
    }

    function setNote(node, text, html, paragraphClassName) {
        if (!node) {
            return;
        }

        if (html) {
            node.innerHTML = html;
            node.hidden = false;
            return;
        }

        if (text) {
            appendParagraphs(node, text, paragraphClassName);
            return;
        }

        node.hidden = true;
    }

    function isOrderedList(config) {
        return config.listType === "ordered" || config.listType === "numbered" || config.ordered === true || config.numbered === true;
    }

    function renderEntry(entry) {
        var normalized = typeof entry === "string" ? { text: entry } : (entry || {});
        var item = document.createElement("li");
        var copy = document.createElement("p");
        var metaParts = [normalized.date, normalized.location].filter(Boolean);

        item.className = "list-entry";
        copy.className = "list-entry-copy";

        if (normalized.content) {
            copy.innerHTML = normalized.content;
        } else {
            copy.textContent = normalized.text || "";
        }

        item.appendChild(copy);

        if (metaParts.length) {
            var meta = document.createElement("p");

            meta.className = "list-meta";
            meta.textContent = metaParts.join(" · ");
            item.appendChild(meta);
        }

        if (normalized.note || normalized.noteHtml) {
            var note = document.createElement("div");

            note.className = "list-note";
            setNote(note, normalized.note, normalized.noteHtml, "list-note-paragraph");
            item.appendChild(note);
        }

        return item;
    }

    var title = page.title || "Untitled list";
    var list = document.createElement(isOrderedList(page) ? "ol" : "ul");
    var entries = Array.isArray(page.entries) ? page.entries : [];
    var headerMetaParts = [page.date, page.location].filter(Boolean);

    document.title = title + " | lists | aubrieta";
    heading.textContent = title;

    setCopy(lede, page.intro, page.introHtml);
    setNote(pageNote, page.pageNote, page.pageNoteHtml, "list-page-note-paragraph");

    if (headerMeta) {
        headerMeta.textContent = headerMetaParts.join(" · ");
        headerMeta.hidden = headerMetaParts.length === 0;
    }

    list.className = "list-items";
    list.dataset.listType = isOrderedList(page) ? "ordered" : "unordered";
    list.setAttribute("aria-label", title);

    if (!entries.length) {
        entries = [
            {
                text: "Add your first item in window.LIST_PAGE.entries.",
                note: "Each item can be a simple string or an object with text, content, date, location, and note."
            }
        ];
    }

    entries.forEach(function (entry) {
        list.appendChild(renderEntry(entry));
    });

    mount.replaceWith(list);
}());
