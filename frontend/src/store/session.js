import jwtFetch from './jwt';

const RECEIVE_CURRENT_USER = "session/RECEIVE_CURRENT_USER";
const RECEIVE_SESSION_ERRORS = "session/RECEIVE_SESSION_ERRORS";
const CLEAR_SESSION_ERRORS = "session/CLEAR_SESSION_ERRORS";
export const RECEIVE_USER_LOGOUT = "session/RECEIVE_USER_LOGOUT";
export const PATCH_USER = "session/PATCH_USER";

const RECEIVE_REQUESTED_EVENT = "session/RECEIVE_REQUESTED_EVENT";
const RECEIVE_JOINED_EVENT = "session/RECEIVE_JOINED_EVENT";
const RECEIVE_CREATED_EVENT = "session/RECEIVE_CREATED_EVENT";
const DELETE_REQUESTED_EVENT = "session/DELETE_REQUESTED_EVENT";
const DELETE_JOINED_EVENT = "session/DELETE_JOINED_EVENT";
const DELETE_CREATED_EVENT = "session/DELETE_CREATED_EVENT";

// Dispatch receiveCurrentUser when a user logs in.
const receiveCurrentUser = currentUser => ({
  type: RECEIVE_CURRENT_USER,
  currentUser
});
  
// Dispatch receiveErrors to show authentication errors on the frontend.
const receiveErrors = errors => ({
  type: RECEIVE_SESSION_ERRORS,
  errors
});

// Dispatch logoutUser to clear the session user when a user logs out.
const logoutUser = () => ({
  type: RECEIVE_USER_LOGOUT
});

// Dispatch clearSessionErrors to clear any session errors.
export const clearSessionErrors = () => ({
  type: CLEAR_SESSION_ERRORS
});

export const patchUser = (user) => ({
  type: PATCH_USER,
  user
})

export const addRequestedEvent = (event) => ({
  type: RECEIVE_REQUESTED_EVENT,
  event
})

export const addCreatedEvent = (event) => ({
  type: RECEIVE_CREATED_EVENT,
  event
})

export const addJoinedEvent = (event) => ({
  type: RECEIVE_JOINED_EVENT,
  event
})

export const deleteRequestedEvent = (eventId) => ({
  type: DELETE_REQUESTED_EVENT,
  eventId
})

export const deleteCreatedEvent = (eventId) => ({
  type: DELETE_CREATED_EVENT,
  eventId
})

export const deleteJoinedEvent = (eventId) => ({
  type: DELETE_JOINED_EVENT,
  eventId
})

export const signup = user => startSession(user, 'api/users/register');
export const login = user => startSession(user, 'api/users/login');

const startSession = (userInfo, route) => async dispatch => {
  try {  
    const res = await jwtFetch(route, {
      method: "POST",
      body: JSON.stringify(userInfo)
    });
    const { user, token } = await res.json();
    localStorage.setItem('jwtToken', token);
    return dispatch(receiveCurrentUser(user));
  } catch(err) {
    const res = await err.json();
    if (res.statusCode === 400) {
      return dispatch(receiveErrors(res.errors));
    }
  }
};
export const getCurrentUser = () => async dispatch => {
  const res = await jwtFetch('/api/users/current');
  const user = await res.json();
  return dispatch(receiveCurrentUser(user));
};

export const logout = () => dispatch => {
  localStorage.removeItem('jwtToken');
  dispatch(logoutUser());
};

export const updateUser = (userInfo) => async dispatch => {
  const res = await jwtFetch(`/api/users/`, {
    method: 'PATCH',
    body: JSON.stringify(userInfo),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await res.json();
  return dispatch(patchUser(data))
}

const initialState = {
  user: undefined
};
  
const sessionReducer = (state = initialState, action) => {
  const newState = {...state};
  switch (action.type) {
    case RECEIVE_CURRENT_USER:
      let user = {...action.currentUser};
      if (!Object.keys(user).length) return initialState;

      if (action.currentUser) {
        user.createdEvents = {};
        action.currentUser.createdEvents.forEach(event => user.createdEvents[event._id] = event)
  
        user.joinedEvents = {};
        action.currentUser.joinedEvents.forEach(event => user.joinedEvents[event._id] = event)
  
        user.requestedEvents = {};
        action.currentUser.requestedEvents.forEach(event => user.requestedEvents[event._id] = event)
      }

      return { user };
    case RECEIVE_USER_LOGOUT:
      return initialState;
    case PATCH_USER:
      console.log("current", newState);
      console.log("new", action.user);
      return { user: {...newState.user, ...action.user} }
    case RECEIVE_REQUESTED_EVENT:
      newState.user.requestedEvents[action.event._id] = action.event;
      return newState
    case RECEIVE_CREATED_EVENT:
      newState.user.createdEvents[action.event._id] = action.event;
      return newState
    case RECEIVE_JOINED_EVENT:
      newState.user.joinedEvents[action.event._id] = action.event;
      return newState
    case DELETE_REQUESTED_EVENT:
      delete newState.user.requestedEvents[action.eventId];
      return newState;
    case DELETE_CREATED_EVENT:
      delete newState.user.createdEvents[action.eventId];
      return newState;
    case DELETE_JOINED_EVENT:
      delete newState.user.joinedEvents[action.eventId];
      return newState;
    default:
      return state;
  }
};
const nullErrors = null;

export const sessionErrorsReducer = (state = nullErrors, action) => {
  switch(action.type) {
    case RECEIVE_SESSION_ERRORS:
      return action.errors;
    case RECEIVE_CURRENT_USER:
    case CLEAR_SESSION_ERRORS:
      return nullErrors;
    default:
      return state;
  }
};

export default sessionReducer;