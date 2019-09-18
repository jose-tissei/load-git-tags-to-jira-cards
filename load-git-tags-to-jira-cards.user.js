// ==UserScript==
// @name         Load gitlab tags to jira cards
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       José Tissei <z.94@live.com>
// @match        https://jira.hbsis.com.br/secure/RapidBoard.jspa?rapidView=*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require https://code.jquery.com/jquery-2.1.4.min.js
// @require https://github.com/js-cookie/js-cookie/releases/download/v2.2.1/js.cookie-2.2.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    $(document).ready(function(){
debugger;
        if(!Cookies.get('gitlab-token')){
            var token = prompt('informe seu token do gitlab');
            Cookies.set('gitlab-token', token)
        }

        if(!Cookies.get('gitlab-token')){
            alert('token do gitlab não encontrado, recarregue a pagina')
        }

        var findAndFillTags = (project, settings) => {
            settings.url = 'https://gitlab.ambevdevs.com.br/api/v4/projects/'+project.id+'/repository/tags'
            $.ajax(settings).done(function (response) {
                var tags = {}
                response.forEach(value => {
                    var cardId = /(MES-[0-9]+)\w+/g.exec(value.commit.title)
                    if(!cardId) return;
                    tags[cardId[0]] = value.name
                })
                $('.ghx-issue').each((i, el) => {
                    var card = $(el);
                    var cardId = card.attr('data-issue-key')
                    if(!tags[cardId]) return;
                    card.find('.ghx-card-footer').get(0).innerHTML += `<a href="https://gitlab.ambevdevs.com.br/`+project.path+`/tags/`+tags[cardId]+`" tabindex="-1" class="js-key-link ghx-key-link"><div class="ghx-end"><div class="ghx-corner"><aui-badge class="" title="Git Tag">`+project.name+`: `+tags[cardId]+`</aui-badge></div></div></a>`
                })
            })
        }

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://gitlab.ambevdevs.com.br/api/v4/projects",
            "method": "GET",
            "headers": {
                "PRIVATE-TOKEN": Cookies.get('gitlab-token'),
                "Content-Type": "application/json",
            }
        }

        $.ajax(settings).done(function (response) {
            var projects = response.map(value => {
                return {
                    id: value.id,
                    path: value.path_with_namespace,
                    name: value.name
                }
            })
            projects.forEach(project => findAndFillTags(project, settings))
        });

})})();
