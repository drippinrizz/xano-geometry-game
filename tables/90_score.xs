table score {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    int score?
    uuid user_id? {
      table = "user"
    }
  
    uuid game_id? {
      table = "game"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}