import React, { Component, Fragment } from "react";

// import openSocket from "socket.io-client";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

class Feed extends Component {
  state = {
    isEditing: false, // controls if create/edit modal is open
    posts: [], // stores all loaded posts
    totalPosts: 0, // total number of posts from backend
    editPost: null, // post selected for editing
    status: "", // user's status text
    postPage: 1, // current pagination page
    postsLoading: true, // loading indicator for posts
    editLoading: false, // loading indicator for edit/create request
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `
      {
        user {
          status
        }
      }
    `,
    };

    // Fetch user status on initial load
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      body: JSON.stringify(graphqlQuery),
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching status failed!!");
        }
        this.setState({ status: resData.data.user.status });
      })
      .catch(this.catchError);

    // Load posts immediately after mount
    this.loadPosts();

    // this.socket = openSocket("http://localhost:8080");
    // this.socket.on("posts", (data) => {
    //   console.log(" SOCKET EVENT RECEIVED:", data);
    //   if (data.action === "create") {
    //     this.addPost(data.post);
    //   } else if (data.action === "update") {
    //     this.updatePost(data.post);
    //   } else if (data.action === "delete") {
    //     this.loadPosts();
    //   }
    // });
  }

  // // update the existing data with the post received
  // addPost = (post) => {
  //   this.setState((prevState) => {
  //     const updatedPosts = [...prevState.posts];
  //     if (!prevState.postPage || prevState.postPage === 1) {
  //       updatedPosts.pop();
  //       updatedPosts.unshift(post);
  //     }
  //     return {
  //       posts: updatedPosts,
  //       totalPosts: prevState.totalPosts + 1,
  //     };
  //   });
  // };

  // updatePost = (post) => {
  //   this.setState((prevState) => {
  //     const updatedPosts = [...prevState.posts];
  //     const updatedPostIndex = updatedPosts.findIndex(
  //       (p) => p._id === post._id
  //     );
  //     if (updatedPostIndex > -1) {
  //       updatedPosts[updatedPostIndex] = post;
  //     }
  //     return {
  //       posts: updatedPosts,
  //     };
  //   });
  // };

  // Load posts based on pagination direction

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] }); // reset UI before reload
    }
    // Pagination
    let page = this.state.postPage;
    // Move to next page
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    // Move to previous page
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }

    //fetching the postData
    const graphqlQuery = {
      query: `
      query FetchPosts($page: Int ){
        posts(page: $page){
           posts{
            _id
            content
            title
            imageUrl
            creator {
            name
            }
            createdAt
          }
          totalPosts
        }
      }
        `,
      variables: {
        page: page,
      },
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token, // adding the token to get posts request
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching Post failed!!");
        }
        // Save posts + total items to state
        this.setState({
          posts: resData.data.posts.posts.map((post) => {
            return {
              ...post,
              imagePath: post.imageUrl,
            };
          }),
          totalPosts: resData.data.posts.totalPosts,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  // Submit updated status text
  statusUpdateHandler = (event) => {
    event.preventDefault();
    const graphqlQuery = {
      query: `
      mutation UpdateUserStatus($userStatus: String) {
      updateStatus(status: $userStatus){
      status
      }
      }
      `,
      variables: {
        userStatus: this.state.status,
      },
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching Status failed!!");
        }
        console.log(resData); // for debugging
      })
      .catch(this.catchError);
  };

  // Start create-post mode
  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  // Start edit-post mode
  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      // Find the post by ID and clone it
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  // Cancel editing or creating a post
  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  // Finish creating or editing a post
  finishEditHandler = (postData) => {
    this.setState({ editLoading: true }); // show spinner on modal

    // rest api endpoint connection to upload the images
    const formData = new FormData();
    formData.append("image", postData.image);
    if (this.state.editPost) {
      formData.append("oldPath", this.state.editPost.imagePath);
    }

    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.props.token, // adding the token to get posts request
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((fileResData) => {
        const imageUrl = fileResData.filePath || "undefined";
        let graphqlQuery = /* GraphQL */ {
          query: `
          mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!){
            createPost(postInput: {title: $title, 
            content: $content, 
             imageUrl: $imageUrl) {
                _id
                title
                content
                imageUrl
                creator {
                name        #grapgql gives the exact data needed
                }
                createdAt
              }
            }
          `,
          variables: {
            title: postData.title,
            content: postData.content,
            imageUrl: imageUrl,
          },
        };

        if (this.state.editPost) {
          graphqlQuery = {
            query: `
            mutation UpdateExistingPost($id: ID!, $title:String!, $content: String!, $imageUrl: String!){
              updatePost(id: $id, postInput: {title: $title,
              content: $content, 
              imageUrl: $imageUrl}) {
                  _id
                  title
                  content
                  imageUrl
                  creator {
                  name        #grapgql gives the exact data needed
                  }
                  createdAt
                }
              }
            `,
            variables: {
              id: this.state.editPost._id,
              title: postData.title,
              content: postData.content,
              imageUrl: imageUrl,
            },
          };
        }
        return fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlQuery),
          headers: {
            Authorization: "Bearer " + this.props.token, // adding the token to get posts request
            "Content-Type": "application/json",
          },
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure the email isn't used yet"
          );
        }
        if (resData.errors) {
          throw new Error("User Login failed!!");
        }

        let resDataField = "createPost";
        // Format returned post data
        if (this.state.editPost) {
          resDataField = "updatePost";
        }
        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          creator: resData.data[resDataField].creator,
          createdAt: resData.data[resDataField].createdAt,
          imageUrl: resData.data[resDataField].imageUrl,
        };

        // Update UI depending on create vs edit
        this.setState((prevState) => {
          let updatedPosts = [...prevState.posts];
          let updatedTotalPosts = prevState.totalPosts;
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              (p) => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPosts++;
            if (prevState.posts.length >= 2) {
              updatedPosts.pop(); // for pagination it will remove one elemnet and add new one at the beginning
            }
            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false,
            totalPosts: updatedTotalPosts,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err, // show error modal
        });
      });
  };

  // Handle typing inside the status input field
  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  // Delete a post by ID
  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    const graphqlQuery = {
      query: `
    mutation DeletePost($postId: ID!){
      deletePost(id: $postId)
    }
  `,
      variables: {
        postId: postId,
      },
    };

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token, // adding the token to get posts request
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Deleting Post failed!!");
        }
        console.log(resData);
        this.loadPosts();
        // // Remove deleted post from UI
        // this.setState((prevState) => {
        //   const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  // Clear error modal
  errorHandler = () => {
    this.setState({ error: null });
  };

  // Catch errors from API calls
  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        {/* Error modal for API errors */}
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />

        {/* Edit/Create Post Modal */}
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />

        {/* Status Update Section */}
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>

        {/* Create New Post Button */}
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>

        {/* Posts List */}
        <section className="feed">
          {/* Show loading spinner */}
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}

          {/* No posts fallback */}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}

          {/* Show posts + pagination */}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
