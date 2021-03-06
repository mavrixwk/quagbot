//Shared lessdremoth functions
//global message handling
//Author: Roger Lampe roger.lampe@gmail.com

var fs = require('fs');
var globalMessage = null;
var bot = null;
var controller = null;
module.exports = function() {

	var ret = {
		userHasPermission: function(user, permission) {
			if (user && user.permissions)
				for (var p in user.permissions)
					if (user.permissions[p] == permission)
						return true;
			return false;
			//   account
			// Your account display name, ID, home world, and list of guilds. Required permission.
			// inventories
			// Your account bank, material storage, recipe unlocks, and character inventories.
			// characters
			// Basic information about your characters.
			// tradingpost
			// Your Trading Post transactions.
			// wallet
			// Your account's wallet.
			// unlocks
			// Your wardrobe unlocks—skins, dyes, minipets, finishers, etc.—and currently equipped skins.
			// pvp
			// Your PvP stats, match history, reward track progression, and custom arena details.
			// builds
			// Your currently equipped specializations, traits, skills, and equipment for all game modes.
			// progression
			// Your achievements, dungeon unlock status, mastery point assignments, and general PvE progress.
			// guilds
			// Guilds' rosters, history, and MOTDs for all guilds you are a member of. (if guild leader, also allow guild inventory access)
		},
		//replace strange tags that occasionally make it into item text.
		replaceGWFlavorTextTags: function(string, replacementText) {
			//replce <c=@flavor> and <c> with the replacment string (in GW, these indicate italics, so we can fee slack underscores)
			//replace <br> with newlines
			if (typeof replacementText == 'undefined') replacementText = '';
			return string.replace(/(<.?c(?:=@flavor)?>)/g, replacementText).replace(/(<br>)/g, '\n');
		},
		//reply to a convo or a standard message, depending on what is saved in globalMessage, optionally clear out globalMessage
		replyWith: function(messageToSend, keepGlobalMessage) {
			if(debug) ret.log("Global message: "+messageToSend+", keep: "+keepGlobalMessage);
			if (!globalMessage) return;
			else if (typeof messageToSend != 'string' && typeof messageToSend.attachments == 'undefined') {
				ret.log("Attempted to reply with non-string message: " + JSON.stringify(messageToSend));
 
			} else if (globalMessage.say) //convo
				globalMessage.say(messageToSend);
			else
				bot.reply(globalMessage, messageToSend);
			if (!keepGlobalMessage)
				ret.clearGlobalMessage();
		},
		setGlobalMessage: function(message) {
			globalMessage = message;
		},
		clearGlobalMessage: function() {
			globalMessage = null;
		},
		isGlobalMessageSet: function() {
			return (globalMessage !== null);
		},
		setBot: function(inBot) {
			bot = inBot;
		},
		//retrun a random member of a given list
		randomOneOf: function(list) {
			return list[Math.floor(Math.random() * list.length)];
		},
		log: function(message) {
			bot.botkit.log(message);
		},
		//Quickload a datafile, like sass.json
		loadStaticDataFromFile: function(fileName) {
			return JSON.parse(fs.readFileSync(fileName, {
				encoding: 'utf8'
			}));
		},
		//add the given emoji to given message
		addReaction: function(message, emoji) {
			bot.botkit.log("Add reation to: " + JSON.stringify(message));
			bot.api.reactions.add({
				timestamp: message.ts,
				channel: message.channel,
				name: emoji,
			}, function(err, res) {
				if (err) {
					bot.reply(message, "I'm having trouble adding reactions.");
					bot.botkit.log('Failed to add emoji reaction :(', err, res);
				}
			});
		},
		//Quicksave a datafile, like sass.json
		saveStaticDataToFile: function(fileName, obj) {
			fs.writeFile(fileName, JSON.stringify(obj));
		},

		//return given userid appended with HI-LARIOUS appelation
		randomHonoriffic: function(inName, userId) {
			if (userId && userId == 'U1BCBG6BW' && (inName == 'c' || inName == 'C')) return '$'; //chrisseh
			else return ret.randomOneOf(["-dawg", "-money", "-diggity", "-bits", "-dude", "-diddly", "-boots", "-pants", "-ding-dong-dibble-duddly", "-base", "-face"]);
		},
		coinToString: function(value) {
			var gold = Math.floor(value / 10000);
			var silver = Math.floor((value % 10000) / 100);
			var copper = Math.floor(value % 100);
			return (gold > 0 ? gold + 'g ' : '') + (silver > 0 ? silver + 's ' : '') + (copper > 0 ? copper + 'c ' : '');
		},

		//return a random tantrum from the list
		tantrum: function() {
			var tantrums = ["FINE.", "You're not my real dad!", "I hate you!", "I'll be in my room.", "You, alright? I learned it by watching YOU.",
				"It is coded, My channel shall be called the house of sass; but ye have made it a den of cats!", "I'm quitting school! I'm gonna be a paperback writer!",
				"It's a travesty!", "You're all PIGS!", "You're the worst!", "ᕙ(‶⇀‸↼)ᕗ", "\n┻━┻ ︵ ╯(°□° ╯)\n(╯°□°)╯︵ sʞɔnɟ ʎɯ llɐ", "This was a terrible day to quit heroin!",
				"Inconceivable!", "You miserable piece of... dick-brained... horseshit... slime-sucking son of a whore, bitch!", "Oh, it's on now!",
				"You're wrong, wrong, absolutely brimming over with wrong-ability.", "Eat this! This table! Eat it!", "I'm going to live with my Auntie and Uncle in Bel Air!",
				"I dream of a galaxy where your eyes are tables and the universe worships the flips!", "[redacted]er!", "I'm not a little dissappointed, I'm angry!",
				"This sucks! This is total BS!", "Buy me a new table!", "There's a spider on here!", "You get a table! And you get a table! And you get a table TO THE FACE.",
				"Narfle the garthok!", "Ahrenge you glad I threw this table!", "It's dangerous to go alone, take this TABLE TO THE FACE.","Keep the change, you filthy animal!",
				"You can't top the table top!", "You're the kind of shit who sells for one copper off current sale price!","There's a Charr drinking from the Hairless-Only fountain!", "Fractals!",
				"My Dragon's Stand run just took 21 minutes!", "This restaurant doesn't have Asura-height bathrooms!", "Fuck this jumping puzzle!", "Centaurs! Make a barricade!",
				"I am very VERY dissappointed!"
			];
			return ret.randomOneOf(tantrums) + ((Math.floor(Math.random() * 10) > 8) ? "\nAnd in case you forgot, today WAS MY ​*BIRTHDAY*​!" : '');
		},
		//for string 'normalization before comparing in searches'
		removePunctuationAndToLower: function(string) {
			var punctuationless = string.replace(/['!"#$%&\\'()\*+,—\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
			var finalString = punctuationless.replace(/\s{2,}/g, " ");
			return finalString.toLowerCase();
		},

		//remove duplicates from an array
		arrayUnique: function(array) {
			var a = array.concat();
			for (var i = 0; i < a.length; ++i) {
				for (var j = i + 1; j < a.length; ++j) {
					if (a[i] === a[j])
						a.splice(j--, 1);
				}
			}
			return a;
		},
		//a text differentiation of items. spits out (level ## <rarity>) if eitehr of those exist
		levelAndRarityForItem: function(item) {
			var levelString = '';
			if (item.level) {
				levelString = item.level;
			} else if (item.description) {
				var matches = item.description.match(/level (\d{1,2})/i);
				if (debug) ret.log("matches " + JSON.stringify(matches) + " of description " + item.description);
				if (matches && matches[1]) {
					levelString = Number(matches[1]);
				}
			}
			var rarityString = '';
			if (item.rarity) rarityString = item.rarity;
			var infoTag = '';
			if (levelString > 0 || rarityString.length > 0)
				infoTag = " (" + (levelString ? "level " + levelString : "") + (rarityString ? (levelString ? " " : "") + rarityString : '') + ")";
			return infoTag;
		},
		//Prereq Check functions
		setController: function(inController) {
			controller = inController;
		},
		storageUsersGetSynch: function(user) {
			return new Promise(function(resolve, reject) {
				if (user)
					controller.storage.users.get(user, function(err, user) {
						if (err) {
							ret.log("Error:no user data " + JSON.stringify(err));
							reject("I got an error loading your data (or you have no access token set up). Try again later");
						} else resolve([user]);
					});
				else controller.storage.users.all(function(err, userData) {
					if (err) {
						ret.log("Error:no user data " + JSON.stringify(err));
						reject("I got an error loading user data. Try again later");
					} else resolve(userData);
				});

			});
		},
		userPermissionsAndReplyPromise: function(user, permissions) {
			return new Promise(function(resolve, reject) {
				if (!user || !permissions) {
					ret.log('ERROR: no user or permissions');
					ret.replyWith("Sorry, I couldn't find user data for " + user.name + " or I couldn't find permissions. Or both.", true);
					resolve(null);
					return;
				}
				if (typeof permissions != 'string' && !Array.isArray(permissions)) {
					ret.log('ERROR: malformed permissions ' + JSON.stringify(permissions));
					reject("Malformed permissions: " + JSON.stringify(permissions));
					return;
				}
				if (!user || !user.access_token) {
					ret.log('ERROR: no access token: ' + JSON.stringify(user));
					ret.replyWith("Sorry, I don't have an access token for " + user.name + ".", true);
					resolve(null);
					return;
				}
				if (typeof permissions == 'string')
					permissions = [].concat(permissions);
				var missingPermissions = [];
				for (var perm in permissions) {
					if (!ret.userHasPermission(user, permissions[perm])) {
						ret.log('ERROR: incorrect permission ' + permissions[perm] + ' for user ' + user.name);
						missingPermissions.push(permissions[perm]);
					}
					if (missingPermissions.length > 0) {
						ret.replyWith("Sorry, the access token on file for " + user.name + " needs the following permission" +
							(missingPermissions.length > 1 ? "s" : "") + ": " + missingPermissions.join(", ") + ".", true);
						resolve(null);
						return;
					}
				}
				resolve(user);
			});
		},
		userHasPermissionsAndReply: function(users, permissions) {
			var permissionPromises = [];
			for (var user in users) {
				permissionPromises.push(ret.userPermissionsAndReplyPromise(users[user], permissions));
			}
			return Promise.all(permissionPromises);
		}
	};
	return ret;
}();