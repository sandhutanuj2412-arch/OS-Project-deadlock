#include <bits/stdc++.h>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
    
    Node(int val) {
        data = val;
        left = right = nullptr;
    }
};

Node* insert(Node* root, int val) {
    if (root == nullptr) {
        return new Node(val);
    }
    
    if (val < root->data) {
        root->left = insert(root->left, val);
    }
    else if (val > root->data) {
        root->right = insert(root->right, val);
    }
    
    return root;
}
void inorder(Node* root){
    if(root == nullptr){
        return;
    }
    inorder(root->left);
    cout<<root->data<<" ";
    inorder(root->right);
}
int height(Node* root){
    if(root == nullptr) return 0;
    int l = height(root->left);
    int r = height(root->right);
    return 1+max(l,r);
}
void levelOrderTraversal(Node* root){
    if(root == nullptr) return;
    queue<Node*>f;
    vector<int>ans;
    f.push(root);
    while(!f.empty()){
        Node* temp = f.front();
        ans.push_back(temp->data);
        f.pop();
        if(temp->left != nullptr) f.push(temp->left);
        if(temp->right != nullptr) f.push(temp->right);
    }
    cout<<"Level order Traversal: ";
    for(auto i : ans) cout<<i<<" ";
    cout<<endl;
}
void zigzagTraversal(Node* root){
    if(root == nullptr) return;
    
    queue<Node*> f;
    vector<vector<int>> ok;
    f.push(root);
    int level = 0;
    
    while(!f.empty()){
        int size = f.size();
        vector<int> ans;
        
        for(int i = 0; i < size; i++){
            Node* temp = f.front();
            ans.push_back(temp->data);
            f.pop();
            
            if(temp->left != nullptr) f.push(temp->left);
            if(temp->right != nullptr) f.push(temp->right);
        }
        
        if(level % 2 == 1){
            reverse(ans.begin(), ans.end());
        }
        ok.push_back(ans);
        level++;
    }
    
    cout<<"Zigzag Traversal: ";
    for(auto& level_vec : ok){
        for(auto i : level_vec){
            cout<<i<<" ";
        }
    }
    cout<<endl;
}
int main() {
    Node* root = nullptr;
    root = insert(root,50);
    root = insert(root,30);
    root = insert(root,70);
    root = insert(root,20);
    root = insert(root,40);
    root = insert(root,80);
    inorder(root);
    return 0;
}
