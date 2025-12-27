// ==UserScript==
// @name        Weibo Plus
// @name:zh-CN  Weibo 增强
// @name:zh-TW  Weibo 增強
// @namespace   https://github.com/Ahaochan/Tampermonkey
// @version     0.0.1
// @icon        https://weibo.com/favicon.ico
// @description 优化微博体验
// @description:zh-CN 优化微博体验
// @author      Ahaochan
// @include     http*://weibo.com/u/*
// @match       https://weibo.com/u
// @license     GPL-3.0
// @supportURL  https://github.com/Ahaochan/Tampermonkey
// @grant       GM_setClipboard
// @require     https://update.greasyfork.org/scripts/505351/1435420/jquery%20221.js
// @require     https://greasyfork.org/scripts/375359-gm4-polyfill-1-0-1/code/gm4-polyfill-101.js?version=652238
// @run-at      document-end
// @noframes
// ==/UserScript==
jQuery($ => {
    'use strict';
    // 加载依赖
    // ============================ jQuery插件 ====================================
    $.fn.extend({
        fitWindow() {
            this.css('width', 'auto').css('height', 'auto')
                .css('max-width', '').css('max-height', $(window).height());
        },
        replaceTagName(replaceWith) {
            const tags = [];
            let i = this.length;
            while (i--) {
                const newElement = document.createElement(replaceWith);
                const thisi = this[i];
                const thisia = thisi.attributes;
                for (let a = thisia.length - 1; a >= 0; a--) {
                    const attrib = thisia[a];
                    newElement.setAttribute(attrib.name, attrib.value);
                }
                newElement.innerHTML = thisi.innerHTML;
                $(thisi).after(newElement).remove();
                tags[i] = newElement;
            }
            return $(tags);
        },
        getBackgroundUrl() {
            const imgUrls = [];
            this.each(function (index, {style}) {
                let bgUrl = $(this).css('background-image') || style.backgroundImage || 'url("")';
                const matchArr = bgUrl.match(/url\((['"])(.*?)\1\)/);
                bgUrl = matchArr && matchArr.length >= 2 ? matchArr[2] : '';
                imgUrls.push(bgUrl);
            });
            return imgUrls.length === 1 ? imgUrls[0] : imgUrls;
        },
        // TODO 抽取公共的ahao-done方法
    });

    // 1. 显示完整的时间
    setInterval(() => {
        // 1. 窄化选择器，只选择尚未被标记过的元素，减少循环负担
        $('a.head-info_time_6sFQg').not('[data-ai-processed]').each(function() {
            const $time = $(this);
            const fullDateTime = $time.attr('title');

            if (!fullDateTime) return;

            // 2. 标记已处理，防止重复进入逻辑
            $time.attr('data-ai-processed', 'true');
            $time.text(fullDateTime);

            // 3. 构建复制按钮
            const $span = $('<span class="copy-time-span" style="cursor:pointer; color:#eb7350; margin-left:8px; font-weight:bold;"> [复制时间] </span>');

            $span.on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // 4. 关键：拼接绝对路径，方便 NotebookLM 索引
                const fullUrl = window.location.origin + $time.attr('href');
                const markdownLink = `[${fullDateTime}](${fullUrl})`;

                GM_setClipboard(markdownLink);

                // 5. 交互反馈
                const originalText = $span.text();
                $span.text(' ✔ 已复制! ').css('color', '#52c41a');
                setTimeout(() => {
                    $span.text(originalText).css('color', '#eb7350');
                }, 1500);
            });

            $time.after($span);
        });
    }, 1000);
});

