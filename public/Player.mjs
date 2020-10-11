class Player {
  constructor(x, y, score, id) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(direction, speed = 10) {
    switch(direction) {
      case 'ArrowUp':
      case 'KeyW':
        if(this.y > 50) this.y -= speed;
        break;
      case 'ArrowDown':
      case 'KeyS':
        if(this.y < 450) this.y += speed;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        if(this.x > 10) this.x -= speed;
        break;
      case 'ArrowRight':
      case 'KeyD':
        if(this.x <  610) this.x += speed;
        break;
    }
  }

  collision(food) {
    let subSquares = []

    subSquares.push(this.x + '-' + this.y);
    subSquares.push((this.x + 10) + '-' + this.y);
    subSquares.push(this.x + '-' + (this.y + 10));
    subSquares.push((this.x + 10) + '-' + (this.y + 10));

    return subSquares.some(
      coord => 
        coord === (food.x + '-' + food.y) ||
        coord === ((food.x + 10) + '-' + food.y) ||
        coord === (food.x + '-' + (food.y + 10)) ||
        coord === ((food.x + 10) + '-' + (food.y + 10))
    );
  }

  calculateRank(players) {
    let pos = 0;

    let byScore = (a, b) => {
      if(a.score < b.score) return -1;
      else if(a.score > b.score) return 1;

      return 0;
    }

    players.sort(byScore);

    console.log(players);

    players.forEach((player, index) => {
      if(this.id === player.id) pos = players.length - index;
    });

    return pos === 0 ? 
      players.length + '/' + players.length : 
      pos + '/' + players.length;
  }
}

export default Player;
