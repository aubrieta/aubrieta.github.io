(function () {
    // The order here is the ranking, best cronch first.
    // Move a clip number to change its rank; titles and videos stay together.
    var ranking = [1564, 1570, 1565, 1549, 1548, 1549, 1558, 1550, 1556];

    var clips = {
        1548: { title: "brown snake looking thing", note: "very satisfying crisp cronch but relatively hard to come by"},
        1549: { title: "medium leaf pile", note: "relatively deep. good cronch."},
        1550: { title: "tiny yellow", note: "shallow and felt like carpet" },
        1556: { title: "night tiny cronch", note: "crisp but not deep enough. also there were cars. "},
        1558: { title: "narrow yellow curb", note: "there were definitely different kinds of foliage under the yellow leaves. good layering like a parfait." },
        1561: { title: "canada leaf pile", note: "uniform orange. proper leaf pile"},
        1564: { title: "grass with medium leaf", note: "surprisingly the grass did a lot. it's like adding a pinch of salt to a dessert, the contrast really makes it" },
        1565: { title: "acorn", note: "satisfying loner. i wish there were more"},
        1570: { title: "hand cronch", note: "very nice hand cronch, was quite deep. i was very itchy after." }
    };

    window.LIST_PAGE = {
        title: "Ranked foliage cronch",
        intro: "sound on",
        listType: "ordered",
        entries: ranking.map(function (id) {
            var clip = clips[id];
            var asset = "../assets/foliage-cronch/img-" + id;

            return {
                text: clip.title,
                location: clip.file,
                note: clip.note,
                video: {
                    src: asset + ".mp4",
                    poster: asset + ".jpg",
                    label: clip.title
                }
            };
        })
    };
}());
