import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';
import { ALL_LINKS_QUERY } from './LinkList';
import { GC_USER_ID, LINKS_PER_PAGE } from '../constants';

class CreateLink extends Component {

  state = {
    description: '',
    url: ''
  };

  createLink = (e) => {
    e.preventDefault();
    this._createLink();
  }
  
  _createLink = async () => {
    const postedById = localStorage.getItem(GC_USER_ID);
    if (!postedById) {
      console.error('No user logged in');
      return;
    }
    const { description, url } = this.state;
    await this.props.createLinkMutation({
      variables: {
        description,
        url,
        postedById
      },
      update: (store, { data: { createLink } }) => {
        const first = LINKS_PER_PAGE;
        const skip = 0;
        const orderBy = 'createdAt_DESC';
        const data = store.readQuery({
          query: ALL_LINKS_QUERY,
          variables: { first, skip, orderBy }
        });
        data.allLinks.splice(0, 0, createLink);
        data.allLinks.pop();
        store.writeQuery({
          query: ALL_LINKS_QUERY,
          data,
          variables: { first, skip, orderBy }
        });
      }
    });
    this.props.history.push(`/new/1`);
  }

  render() {
    return (
      <form onSubmit={this.createLink}>
        <div className='flex flex-column mt3'>
          <div>
            <label htmlFor='description' className='f6 db mb2'>Description</label>
            <input className='input-reset ba b--black-20 pa2 mb2 db w-100' value={this.state.description} onChange={(e) => this.setState({ description: e.target.value })} type='text' id='description' placeholder='A description for the link' />
          </div>

          <div>
            <label htmlFor='url' className='f6 db mb2'>Url</label>
            <input className='input-reset ba b--black-20 pa2 mb2 db w-100' value={this.state.url} onChange={(e) => this.setState({ url: e.target.value })} type='text' id='url' placeholder='The URL for the link' />
          </div>
        </div>
        <button type='submit' className='f6 link dim ba ph3 pv2 mb2 dib black'>
          Submit
        </button>
      </form>
    );
  }
}

const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation($description: String!, $url: String!, $postedById: ID!) {
    createLink(
      description: $description,
      url: $url,
      postedById: $postedById
    ) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
    }
  }
`;

export default graphql(CREATE_LINK_MUTATION, { name: 'createLinkMutation' })(CreateLink);
