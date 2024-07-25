const { default: api } = require('zotero-api-client');
const { Cite } = require('@citation-js/core')
const fs = require('fs');
// Load plugins
require('@citation-js/plugin-doi')
require('@citation-js/plugin-csl')

const cmdParams = process.argv.slice(2);

async function main() {
    const myapi = api(cmdParams[0]).library('user', cmdParams[1]);
    const response = await myapi.collections().get();
    const items = response.getData();

    let DOIs = [];

    for (const item of items) {
        if (item.name == "Diet") {
            const diet = await myapi.collections(item.key).items().get();
            const items = diet.getData();

            items.forEach(element => {
                if (element.DOI) {
                    DOIs.push(element.DOI);
                }
            });
        }
    }

    let finalDiet = "<!-- BEGIN CITE -->";

    for (const doi of DOIs) {
        let citation = await Cite.async(doi);

        finalDiet = finalDiet + "\n- " + citation.format('bibliography', {
            template: 'apa',
            lang: 'en-US'
        })
    }

    // Replace the text in between the <!-- BEGIN CITE --> and <!-- END CITE --> tags in the README.md
    fs.readFile('README.md', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        const result = data.replace(/<!-- BEGIN CITE -->.*<!-- END CITE -->/s, finalDiet+"\n<!-- END CITE -->");
        fs.writeFile('README.md', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

main()