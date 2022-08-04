/**
* @name Image Resize
* @displayName Image Resize
* @description Send emoji external emoji and animated emoji without Nitro.
* @author Gies
* @version 1.0.0
*/
/*@cc_on
@if (@_jscript)

var shell = WScript.CreateObject("WScript.Shell");
shell.Popup("It looks like you've mistakenly tried to run me directly. That's not how you install plugins. \n(So don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);

@else@*/

module.exports = (() => {
    const config = {
        info: {
            name: 'Image Resize',
            authors: [
                {
                    name: 'Gies',
                    discord_id: '740129506039431168',
                    github_username: 'Gies'
                }
            ],
            version: '1.0.0',
            description: 'Resize user modal profile pictures.',
            github: 'https://github.com/Poilerwags/ImageResize',
            github_raw: 'https://raw.githubusercontent.com/Poilerwags/ImageResize/ImageResize.plugin.js'
        },
        defaultConfig: []
    };
    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        load() {
            BdApi.showConfirmationModal('Library plugin is needed',
                [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`], {
                confirmText: 'Download',
                cancelText: 'Cancel',
                onConfirm: () => {
                    require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
                        if (error) return require('electron').shell.openExternal('https://betterdiscord.app/Download?id=9');
                        await new Promise(r => require('fs').writeFile(require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body, r));
                        window.location.reload();
                    });
                }
            });
        }
        start() { }
        stop() { }
    }
        : (([Plugin, Api]) => {
            const plugin = (Plugin, Api) => {
                const {
                    Patcher,
                    WebpackModules,
                    Toasts,
                    Logger,
                    DiscordModules: {
                        Permissions,
                        DiscordPermissions,
                        UserStore,
                        SelectedChannelStore,
                        ChannelStore,
                        DiscordConstants: {
                            EmojiDisabledReasons,
                            EmojiIntention
                        }
                    }
                } = Api;

                const Emojis = WebpackModules.findByUniqueProperties(['getDisambiguatedEmojiContext', 'searchWithoutFetchingLatest']);
                const EmojiParser = WebpackModules.findByUniqueProperties(['parse', 'parsePreprocessor', 'unparse']);
                const EmojiPicker = WebpackModules.findByUniqueProperties(['useEmojiSelectHandler']);
                const MessageUtilities = WebpackModules.getByProps("sendMessage");
                const EmojiFilter = WebpackModules.getByProps('getEmojiUnavailableReason');

                const EmojiPickerListRow = WebpackModules.find(m => m?.default?.displayName == 'EmojiPickerListRow');

                const SIZE_REGEX = /([?&]size=)(\d+)/;
                const EMOJI_SPLIT_LINK_REGEX = /(https:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|gif|webp)(?:\?size\=\d+&quality=\w*)?)/

                return class Freemoji extends Plugin {
                    currentUser = null;

                    replaceEmoji(text, emoji) {
                        const emojiString = `<${emoji.animated ? "a" : ""}:${emoji.originalName || emoji.name}:${emoji.id}>`;
                        const emojiURL = this.getEmojiUrl(emoji);
                        return text.replace(emojiString, emojiURL + " ");
                    }

                    patch() {}

                    selectEmoji({ emoji, isFinalSelection, onSelectEmoji, closePopout, selectedChannel, disabled }) {}
                  
                    getEmojiUrl(emoji) {
                        return emoji.url.includes("size=") ?
                            emoji.url.replace(SIZE_REGEX, `$1${this.settings.emojiSize}`) :
                            `${emoji.url}&size=${this.settings.emojiSize}`;
                    }
                  
                    cleanup() {
                        Patcher.unpatchAll();
                    }

                    onStart() {
                        try {
                            this.patch();
                        } catch (e) {
                            Toasts.error(`${config.info.name}: An error occured during intialiation: ${e}`);
                            Logger.error(`Error while patching: ${e}`);
                            console.error(e);
                        }
                    }

                    onStop() {
                        this.cleanup();
                    }

                    getSettingsPanel() { return this.buildSettingsPanel().getElement(); }
                };
            };
            return plugin(Plugin, Api);
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
