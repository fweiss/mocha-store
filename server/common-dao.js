class NotFoundError extends Error {
}
class InvalidParameterError extends Error {
}
class InvalidStateError extends Error { }

module.exports = {
    NotFoundError,
    InvalidParameterError,
    InvalidStateError,
}
