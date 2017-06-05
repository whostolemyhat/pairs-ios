/* global game,Phaser */

/**
* Show the menu which allows the game to start
*/
var pairs = pairs || {};

pairs.menuState = {
    create: function() {
        game.stage.backgroundColor = '#f2d8b3';

        this.finalEmitter = game.add.emitter(game.world.centerX, 20, 15);
        this.finalEmitter.makeParticles(pairs.allShapes);
        this.finalEmitter.forEach(function(particle) {
            var colour = pairs.pickColour();
            particle.tint = Phaser.Color.getColor(colour.r, colour.g, colour.b);
        });

        // explode, lifespan, frequency, quantity
        this.finalEmitter.start(false, 5000, 20);

        var nameLabel = game.add.sprite(game.world.centerX, -160, 'header');
        nameLabel.anchor.setTo(0.5, 0);
        game.add.tween(nameLabel).to({ y: 0 }, 1000).easing(Phaser.Easing.Bounce.Out).start();

        if(!localStorage.getItem('highScore')) {
            localStorage.setItem('highScore', 0);
        }

        var playLink = game.add.button(
            game.world.centerX,
            game.world.centerY + 110,
            'play',
            this.start,
            this,
            1,
            0
        );
        playLink.anchor.setTo(0.5, 0.5);
        playLink.input.useHandCursor = true;

        game.add.tween(playLink.scale).to({ x: 1.2, y: 1.2 }, 300).to({ x: 1, y: 1 }, 300).delay(1500).loop().start();

        var creditsLink = game.add.button(
            game.world.centerX,
            game.world.centerY + 170,
            'credits',
            pairs.credits,
            this,
            1,
            0
        );
        creditsLink.anchor.setTo(0.5, 0.5);
    },

    start: function() {
        game.state.start('play');
    },

    toggleSound: function() {
        game.sound.mute = !game.sound.mute;
        this.muteButton.frame = game.sound.mute ? 1 : 0;
    }
};


pairs.credits = function () {
    var credits = document.querySelector('.credits');
    credits.classList.add('credits--visible');
}


