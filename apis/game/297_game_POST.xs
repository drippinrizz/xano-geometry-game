// Add game record
query game verb=POST {
  input {
    dblink {
      table = "game"
    }
  }

  stack {
    db.add game {
      data = {created_at: "now", token: $crypto1}
    } as $game
  }

  response = $game
}