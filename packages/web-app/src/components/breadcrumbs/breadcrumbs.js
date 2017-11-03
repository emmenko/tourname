import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;

  > * + * {
    margin: 0 0 0 8px;
  }
`;
const BreadcrumbLabel = styled.div`
  color: ${props => (props.inactive ? '#aaa' : '#0074d9')};
`;
const BreadcrumbSeparator = styled.div``;

const Breadcrumb = props => {
  if (props.linkTo)
    return (
      <BreadcrumbLabel>
        <Link to={props.linkTo}>{props.children}</Link>
      </BreadcrumbLabel>
    );
  return <BreadcrumbLabel inactive={true}>{props.children}</BreadcrumbLabel>;
};
Breadcrumb.propTypes = {
  linkTo: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const Breadcrumbs = props => {
  const numberOfBreadcrumbs = React.Children.count(props.children);
  return (
    <BreadcrumbContainer>
      {React.Children.map(props.children, (child, i) => {
        const isLastChild = i === numberOfBreadcrumbs - 1;
        if (isLastChild) return child;
        return [
          child,
          <BreadcrumbSeparator key={i}>{props.separator}</BreadcrumbSeparator>,
        ];
      })}
    </BreadcrumbContainer>
  );
};
Breadcrumbs.propTypes = {
  separator: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export { Breadcrumb, Breadcrumbs };
