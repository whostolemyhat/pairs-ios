/* global game, Phaser */

/**
* load all the assets
*/
var pairs = pairs || {};

pairs.star = 'star';
pairs.rings = 'rings';
pairs.hex = 'hex';
pairs.square = 'square';
pairs.diamond = 'diamond';
pairs.circle = 'circle';
pairs.triangle = 'triangle';

// shape colours
// then call Phaser.Color.getColor(self.darkGrey.r, self.darkGrey.g, self.darkGrey.b)
pairs.navyBlue = Phaser.Color.createColor(60, 60, 100);
pairs.brown = Phaser.Color.createColor(185,138,122);
pairs.purple = Phaser.Color.createColor(138,76,124);
pairs.russet = Phaser.Color.createColor(174,70,0);
pairs.amber = Phaser.Color.createColor(255,149,22);
pairs.pink = Phaser.Color.createColor(244,160,170);
pairs.chocolate = Phaser.Color.createColor(89,31,0);

// ui colours
pairs.white = Phaser.Color.createColor(255, 255, 255);
pairs.darkGrey = Phaser.Color.createColor(74,72,73);
pairs.peach = Phaser.Color.createColor(242,216,179);

pairs.allColours = [pairs.chocolate, pairs.brown, pairs.purple, pairs.russet, pairs.amber, pairs.pink, pairs.navyBlue];
pairs.allShapes = [pairs.star, pairs.rings, pairs.hex, pairs.square, pairs.diamond, pairs.circle, pairs.triangle];

pairs.pickColour = function() {
    return pairs.allColours[Math.floor(Math.random() * pairs.allColours.length)];
};

pairs.pickShape = function() {
    return pairs.allShapes[Math.floor(Math.random() * pairs.allShapes.length)];
};

pairs.loadState = {
    preload: function() {
        var loadingLabel = game.add.text(
            game.world.centerX,
            game.world.centerY - 40,
            'loading...',
            {
                font: '30px Arial',
                fill: '#fff'
            }
        );
        loadingLabel.anchor.setTo(0.5, 0.5);

        // progress bar
        var progressBar = game.add.sprite(game.world.centerX, game.world.centerY, 'progressBar');
        progressBar.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progressBar);

        // load all assets
        game.load.spritesheet('mute', 'img/menu/muteButton.png', 28, 22);
        game.load.spritesheet('play', 'img/menu/play.png', 200, 50);
        game.load.spritesheet('credits', 'img/menu/credits.png', 200, 50);

        game.load.image('header', 'img/menu/header.png');

        game.load.image('box', 'img/box.png');
        game.load.image('pixel', 'img/pixel.png');
        game.load.image('circle', 'img/icons/circle.png');
        game.load.image('diamond', 'img/icons/diamond.png');
        game.load.image('hex', 'img/icons/hex.png');
        game.load.image('rings', 'img/icons/rings.png');
        game.load.image('square', 'img/icons/square.png');
        game.load.image('star', 'img/icons/star.png');
        game.load.image('triangle', 'img/icons/triangle.png');
        
        game.load.image('pause', 'img/menu/pause.png');
    },

    create: function() {
        game.state.start('menu');
    }
};

