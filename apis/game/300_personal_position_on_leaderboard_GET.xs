query personalPositionOnLeaderboard verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query score {
      return = {type: "list"}
    } as $score1
  
    array.find_index ($score1) if ($this.user_id == $auth.id) as $x2|add:1
  }

  response = $x2
}