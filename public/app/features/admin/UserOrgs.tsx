import React, { PureComponent } from 'react';
import { css, cx } from 'emotion';
import { Modal, Themeable, stylesFactory, withTheme, ConfirmButton } from '@grafana/ui';
import { GrafanaTheme } from '@grafana/data';
import { UserOrg } from 'app/types';
import { ActionButton } from './ActionButton';

interface Props {
  orgs: UserOrg[];

  onOrgRemove: (orgId: number) => void;
  onOrgRoleChange: (orgId: number, newRole: string) => void;
}

interface State {
  showAddOrgModal: boolean;
}

export class UserOrgs extends PureComponent<Props, State> {
  state = {
    showAddOrgModal: false,
  };

  handleAddOrg = () => {
    this.setState({ showAddOrgModal: true });
  };

  handleAddOrgModalDismiss = () => {
    this.setState({ showAddOrgModal: false });
  };

  render() {
    const { orgs, onOrgRoleChange, onOrgRemove } = this.props;
    const { showAddOrgModal } = this.state;
    const addToOrgContainerClass = cx(css`
      margin-top: 0.8rem;
    `);

    return (
      <>
        <h3 className="page-heading">Organisations</h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <table className="filter-table form-inline">
              <tbody>
                {orgs.map((org, index) => (
                  <OrgRow
                    key={`${org.orgId}-${index}`}
                    org={org}
                    onOrgRoleChange={onOrgRoleChange}
                    onOrgRemove={onOrgRemove}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className={addToOrgContainerClass}>
            <ActionButton text="Add this user to another organisation" onClick={this.handleAddOrg} />
          </div>
          <AddToOrgModal isOpen={showAddOrgModal} onDismiss={this.handleAddOrgModalDismiss} />
        </div>
      </>
    );
  }
}

const ORG_ROLES = ['Viewer', 'Editor', 'Admin'];

const getOrgRowStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    removeButton: css`
      margin-right: 0.6rem;
      text-decoration: underline;
      color: ${theme.colors.blue95};
    `,
    label: css`
      font-weight: 500;
    `,
  };
});

interface OrgRowProps extends Themeable {
  org: UserOrg;
  onOrgRemove: (orgId: number) => void;
  onOrgRoleChange: (orgId: number, newRole: string) => void;
}

interface OrgRowState {
  currentRole: string;
  isChangingRole: boolean;
  isRemovingFromOrg: boolean;
}

class UnThemedOrgRow extends PureComponent<OrgRowProps, OrgRowState> {
  state = {
    currentRole: this.props.org.role,
    isChangingRole: false,
    isRemovingFromOrg: false,
  };

  handleOrgRemove = () => {
    const { org } = this.props;
    this.props.onOrgRemove(org.orgId);
  };

  handleChangeRoleClick = () => {
    const { org } = this.props;
    this.setState({ isChangingRole: true, currentRole: org.role });
  };

  handleOrgRemoveClick = () => {
    this.setState({ isRemovingFromOrg: true });
  };

  handleOrgRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value;
    this.setState({ currentRole: newRole });
  };

  handleOrgRoleSave = () => {
    this.props.onOrgRoleChange(this.props.org.orgId, this.state.currentRole);
  };

  handleCancelClick = () => {
    this.setState({ isChangingRole: false, isRemovingFromOrg: false });
  };

  render() {
    const { org, theme } = this.props;
    const { currentRole, isChangingRole, isRemovingFromOrg } = this.state;
    const styles = getOrgRowStyles(theme);
    const labelClass = cx('width-16', styles.label);

    return (
      <tr>
        <td className={labelClass}>{org.name}</td>
        {isChangingRole ? (
          <td>
            <div className="gf-form-select-wrapper width-8">
              <select value={currentRole} className="gf-form-input" onChange={this.handleOrgRoleChange}>
                {ORG_ROLES.map((option, index) => {
                  return (
                    <option value={option} key={`${option}-${index}`}>
                      {option}
                    </option>
                  );
                })}
              </select>
            </div>
          </td>
        ) : (
          <td className="width-25">{org.role}</td>
        )}
        {!isRemovingFromOrg && (
          <td colSpan={isChangingRole ? 2 : 1}>
            <div className="pull-right">
              <ConfirmButton
                buttonText="Change role"
                confirmText="Save"
                onClick={this.handleChangeRoleClick}
                onCancel={this.handleCancelClick}
                onConfirm={this.handleOrgRoleSave}
              />
            </div>
          </td>
        )}
        {!isChangingRole && (
          <td colSpan={isRemovingFromOrg ? 2 : 1}>
            <div className="pull-right">
              <ConfirmButton
                buttonText="Remove from organisation"
                confirmText="Confirmn removal"
                confirmButtonVariant="danger"
                confirmWidth={13}
                onClick={this.handleOrgRemoveClick}
                onCancel={this.handleCancelClick}
                onConfirm={this.handleOrgRemove}
              />
            </div>
          </td>
        )}
      </tr>
    );
  }
}

const OrgRow = withTheme(UnThemedOrgRow);

interface AddToOrgModalProps {
  isOpen: boolean;
  onDismiss?: () => void;
}

interface AddToOrgModalState {
  orgName: string;
  role: string;
}

export class AddToOrgModal extends PureComponent<AddToOrgModalProps, AddToOrgModalState> {
  state = {
    orgName: '',
    role: 'Admin',
  };

  handleOrgNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      orgName: event.target.value,
    });
  };

  handleOrgRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      role: event.target.value,
    });
  };

  handleAddUserToOrg = () => {
    const { orgName, role } = this.state;
    console.log(`Add user to ${orgName} as ${role}`);
  };

  handleCancel = () => {
    this.props.onDismiss();
  };

  render() {
    const { isOpen } = this.props;
    const { orgName, role } = this.state;

    return (
      <Modal title="Add to an organization" isOpen={isOpen} onDismiss={this.handleCancel}>
        <div className="gf-form-group">
          <h6 className="">Organisation's name</h6>
          <span>You can add users only to an already existing organisation</span>
          <div className="gf-form">
            <input type="text" className="gf-form-input width-25" value={orgName} onChange={this.handleOrgNameChange} />
          </div>
        </div>
        <div className="gf-form-group">
          <h6 className="">Role</h6>
          <div className="gf-form-select-wrapper width-8">
            <select value={role} className="gf-form-input" onChange={this.handleOrgRoleChange}>
              {ORG_ROLES.map((option, index) => {
                return (
                  <option value={option} key={`${option}-${index}`}>
                    {option}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="gf-form-button-row">
          <button className="btn btn-inverse" onClick={this.handleCancel}>
            Cancel
          </button>
          <button className="btn btn-secondary" onClick={this.handleAddUserToOrg}>
            Add to organization
          </button>
        </div>
      </Modal>
    );
  }
}