query leaderboards verb=GET {
  input {
  }

  stack {
    db.query score {
      sort = {score.score: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 15}}
      output = [
        "itemsReceived"
        "curPage"
        "nextPage"
        "prevPage"
        "offset"
        "items.score"
        "items.user_id"
      ]
    
      addon = {
        items.user: {
          name  : "user"
          output: ["name"]
          input : {user_id: $output.user_id}
        }
      }
    } as $model
  }

  response = $model
}