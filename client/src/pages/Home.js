import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Chào mừng đến MyCraft</h1>
            {user ? (
                <h5>Xin chào, {user.username}! Hãy khám phá các sản phẩm thủ công của chúng tôi.</h5>
            ) : (
                <>
                    <h5>Hãy đăng nhập/đăng ký để khám phá các sản phẩm thủ công của chúng tôi</h5>
                    <Link to="/login">
                        <button>Đăng nhập / Đăng ký</button>
                    </Link>
                </>
            )}
        </div>
    );
}

export default Home;